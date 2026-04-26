import os
import time
from sqlalchemy import create_engine, text

MYSQL_URL = os.getenv(
    "MYSQL_URL",
    "mysql+pymysql://root:rootpassword@mysql:3306/webstore"
)

POSTGRES_URL = os.getenv(
    "POSTGRES_URL",
    "postgresql+psycopg2://postgres:rootpassword@postgres:5432/finance"
)

def retry_create_engine(db_url: str, retries: int = 10, delay: int = 5):
    last_error = None
    for attempt in range(1, retries + 1):
        try:
            engine = create_engine(db_url, pool_pre_ping=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[INFO] Connected to DB successfully on attempt {attempt}")
            return engine
        except Exception as e:
            last_error = e
            print(f"[WARN] DB connection failed on attempt {attempt}/{retries}: {e}")
            time.sleep(delay)
    raise last_error

mysql_engine = retry_create_engine(MYSQL_URL)
postgres_engine = retry_create_engine(POSTGRES_URL)