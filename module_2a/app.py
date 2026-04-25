import json
import logging
import os
import time
from decimal import Decimal

import mysql.connector
import pika
from flask import Flask, jsonify, request


app = Flask(__name__)

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("order-api")


def env_int(name, default):
    return int(os.getenv(name, default))


def env_float(name, default):
    return float(os.getenv(name, default))


RETRY_ATTEMPTS = env_int("CONNECT_RETRY_ATTEMPTS", "10")
RETRY_DELAY_SECONDS = env_float("CONNECT_RETRY_DELAY_SECONDS", "3")


def with_retry(name, factory):
    last_error = None
    for attempt in range(1, RETRY_ATTEMPTS + 1):
        try:
            return factory()
        except Exception as exc:
            last_error = exc
            logger.warning(
                "%s connection attempt %s/%s failed: %s",
                name,
                attempt,
                RETRY_ATTEMPTS,
                exc,
            )
            if attempt < RETRY_ATTEMPTS:
                time.sleep(RETRY_DELAY_SECONDS)

    raise RuntimeError(f"{name} is unavailable after retrying") from last_error


def mysql_connection():
    def connect():
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "mysql"),
            port=env_int("DB_PORT", "3306"),
            database=os.getenv("DB_NAME", "webstore"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "rootpassword"),
            connection_timeout=5,
            autocommit=False,
        )

    return with_retry("MySQL", connect)


def order_queue_name():
    return os.getenv("RABBITMQ_QUEUE", "order_queue")


def rabbitmq_channel():
    def connect():
        credentials = pika.PlainCredentials(
            os.getenv("RABBITMQ_USER", "noah"),
            os.getenv("RABBITMQ_PASSWORD", "noahpassword"),
        )
        parameters = pika.ConnectionParameters(
            host=os.getenv("RABBITMQ_HOST", "rabbitmq"),
            port=env_int("RABBITMQ_PORT", "5672"),
            credentials=credentials,
            heartbeat=30,
            blocked_connection_timeout=30,
        )
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue=order_queue_name(), durable=True)
        channel.confirm_delivery()
        return connection, channel

    return with_retry("RabbitMQ", connect)


def positive_int(payload, field_name):
    if field_name not in payload:
        raise ValueError(f"{field_name} is required")

    value = payload[field_name]
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"{field_name} must be an integer")

    if value <= 0:
        raise ValueError(f"{field_name} must be greater than 0")

    return value


def money_to_json(value):
    return str(Decimal(value).quantize(Decimal("0.01")))


def publish_order(order):
    connection = None
    try:
        connection, channel = rabbitmq_channel()
        channel.basic_publish(
            exchange="",
            routing_key=order_queue_name(),
            body=json.dumps(order),
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE,
            ),
        )
    finally:
        if connection and connection.is_open:
            connection.close()


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/orders")
def create_order():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "JSON body is required"}), 400

    try:
        user_id = positive_int(payload, "user_id")
        product_id = positive_int(payload, "product_id")
        quantity = positive_int(payload, "quantity")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    db = None
    cursor = None
    try:
        db = mysql_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, price FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            return jsonify({"error": "product_id does not exist"}), 400

        unit_price = Decimal(product["price"])
        total_price = unit_price * quantity

        cursor.execute(
            """
            INSERT INTO orders (user_id, product_id, quantity, total_price, status)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, product_id, quantity, total_price, "PENDING"),
        )
        order_id = cursor.lastrowid

        order_message = {
            "order_id": order_id,
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
            "total_price": money_to_json(total_price),
            "status": "PENDING",
        }

        try:
            publish_order(order_message)
        except Exception as exc:
            db.rollback()
            logger.exception("Failed to publish order %s: %s", order_id, exc)
            return jsonify({"error": "Failed to create order"}), 503

        db.commit()
    except Exception as exc:
        if db:
            db.rollback()
        logger.exception("Failed to create order: %s", exc)
        return jsonify({"error": "Failed to create order"}), 503
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()

    return jsonify({"message": "Order received", "order_id": order_id}), 202


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env_int("APP_PORT", "5000"))
