import os
import time

import pymysql
from fastapi import FastAPI

app = FastAPI(title="Order API")


def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "mysql"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "noah_user"),
        password=os.getenv("DB_PASSWORD", "noah_password"),
        database=os.getenv("DB_NAME", "webstore"),
        connect_timeout=5,
        cursorclass=pymysql.cursors.DictCursor,
    )


def wait_for_database():
    for _ in range(20):
        try:
            conn = get_connection()
            conn.close()
            return
        except Exception as exc:
            print(f"Database connection failed: {exc}")
            time.sleep(2)
    raise RuntimeError("Cannot connect to MySQL database.")


@app.on_event("startup")
def startup_event():
    wait_for_database()


@app.get("/orders")
def get_orders():
    query = """
        SELECT
            o.id,
            o.user_id,
            o.product_id,
            p.name AS product_name,
            o.quantity,
            o.total_price,
            o.status,
            o.created_at
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        ORDER BY o.created_at DESC
        LIMIT 10
    """

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query)
            orders = cursor.fetchall()
    finally:
        conn.close()

    return {
        "message": "Orders fetched successfully through Order API",
        "count": len(orders),
        "data": orders,
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "order_api"}
