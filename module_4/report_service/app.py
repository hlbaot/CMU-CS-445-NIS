import os
import time

import pymysql
from fastapi import FastAPI

app = FastAPI(title="Report Service")


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


@app.get("/report")
def get_report():
    summary_query = """
        SELECT
            COUNT(*) AS total_orders,
            COALESCE(SUM(quantity), 0) AS total_items,
            COALESCE(SUM(total_price), 0) AS total_revenue
        FROM orders
    """

    top_products_query = """
        SELECT
            p.name AS product_name,
            SUM(o.quantity) AS total_quantity
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        GROUP BY o.product_id, p.name
        ORDER BY total_quantity DESC
        LIMIT 5
    """

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(summary_query)
            summary = cursor.fetchone()
            cursor.execute(top_products_query)
            top_products = cursor.fetchall()
    finally:
        conn.close()

    return {
        "message": "Report generated successfully through Report Service",
        "summary": summary,
        "top_products": top_products,
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "report_service"}
