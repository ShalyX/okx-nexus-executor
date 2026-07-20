import os
import time
import base64
import hmac
import hashlib
import json
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

OKX_API_KEY = os.getenv("OKX_API_KEY")
OKX_SECRET_KEY = os.getenv("OKX_SECRET_KEY")
OKX_PASSPHRASE = os.getenv("OKX_PASSPHRASE")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

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
def process_trade_task(wallet_address: str):
    # In production, we fetch BYOK from DB. Using global for testing.
    if not all([OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE]):
         return {"error": "OKX Mainnet credentials not set in .env"}

    sentiment = "Bullish"
    
    endpoint = '/api/v5/trade/order'
    body = {
        "instId": "ETH-USDT",
        "tdMode": "cash",
        "side": "buy" if sentiment == "Bullish" else "sell",
        "ordType": "market",
        "sz": "0.1"
    }
    
    body_str = json.dumps(body)
    
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    signature = get_okx_signature(timestamp, 'POST', endpoint, body_str, OKX_SECRET_KEY)
    
    headers = {
        'OK-ACCESS-KEY': OKX_API_KEY,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': OKX_PASSPHRASE,
        'x-simulated-trading': '1',
        'Content-Type': 'application/json'
    }
    
    time.sleep(2) # Simulate network/LLM delay
    
    return {
        "status": "success",
        "sentiment": sentiment,
        "message": "Payload successfully signed for OKX v5 Demo Trading",
        "headers_generated": {
            "OK-ACCESS-KEY": "***" + OKX_API_KEY[-4:] if OKX_API_KEY else "***",
            "OK-ACCESS-SIGN": signature,
            "OK-ACCESS-TIMESTAMP": timestamp,
            "x-simulated-trading": "1"
        },
        "payload": body
    }

@app.post("/api/trade-sentiment")
async def queue_trade(request: Request):
    data = await request.json()
    wallet_address = data.get("walletAddress", "0xAnonymous")
    
    # Send task to Celery Queue
    task = process_trade_task.delay(wallet_address)
    
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
