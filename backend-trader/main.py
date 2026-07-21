import os
import time
import base64
import hmac
import hashlib
import json
import uuid
import psycopg2
from psycopg2.extras import DictCursor
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize Celery Queue
celery_app = Celery('trader_queue', broker=REDIS_URL, backend=REDIS_URL)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_okx_signature(timestamp, method, request_path, body, secret_key):
    message = str(timestamp) + str(method) + str(request_path) + str(body)
    mac = hmac.new(bytes(secret_key, encoding='utf8'), bytes(message, encoding='utf-8'), digestmod='sha256')
    d = mac.digest()
    return base64.b64encode(d).decode('utf-8')

@celery_app.task
def process_trade_task(data: dict):
    wallet_address = data.get("walletAddress")
    if not wallet_address:
         return {"error": "Missing walletAddress"}
         
    sentiment = data.get("sentiment", "Bullish")
    sz = data.get("sz", "0.1")
    instId = data.get("instId", "ETH-USDT")

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=DictCursor)
        cur.execute('SELECT "okxApiKey", "okxSecretKey", "okxPassphrase" FROM "User" WHERE "walletAddress" = %s', (wallet_address,))
        user_row = cur.fetchone()
        cur.close()
        conn.close()
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}

    if not user_row or not all([user_row["okxApiKey"], user_row["okxSecretKey"], user_row["okxPassphrase"]]):
         return {"error": f"OKX Mainnet credentials not set for wallet {wallet_address}. Please configure BYOK."}

    api_key = user_row["okxApiKey"]
    secret_key = user_row["okxSecretKey"]
    passphrase = user_row["okxPassphrase"]
    
    endpoint = '/api/v5/trade/order'
    body = {
        "instId": instId,
        "tdMode": "cash",
        "side": "buy" if sentiment == "Bullish" else "sell",
        "ordType": "market",
        "sz": str(sz)
    }
    
    body_str = json.dumps(body)
    
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    signature = get_okx_signature(timestamp, 'POST', endpoint, body_str, secret_key)
    
    headers = {
        'OK-ACCESS-KEY': api_key,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'x-simulated-trading': '1',
        'Content-Type': 'application/json'
    }
    
    time.sleep(2) # Simulate network/LLM delay
    
    return {
        "status": "success",
        "sentiment": sentiment,
        "message": "Payload successfully signed for OKX v5 Demo Trading",
        "headers_generated": {
            "OK-ACCESS-KEY": "***" + api_key[-4:] if api_key else "***",
            "OK-ACCESS-SIGN": signature,
            "OK-ACCESS-TIMESTAMP": timestamp,
            "x-simulated-trading": "1"
        },
        "payload": body
    }

@app.post("/api/trade-sentiment")
async def queue_trade(request: Request):
    data = await request.json()
    
    # Send task to Celery Queue
    task = process_trade_task.delay(data)
    
    return {
        "status": "queued",
        "message": "Trade job has been queued successfully.",
        "jobId": task.id
    }

@app.get("/api/trade-job/{job_id}")
async def get_trade_status(job_id: str):
    task = celery_app.AsyncResult(job_id)
    if task.state == 'PENDING':
        return {"status": "pending"}
    elif task.state != 'FAILURE':
        return {"status": "completed", "result": task.info}
    else:
        return {"status": "failed", "result": str(task.info)}
