"""
Market data router for live market information
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.services.market_data_service import MarketDataService

router = APIRouter()
market_service = MarketDataService()


@router.get("/ticker/{ticker}", response_model=schemas.MarketDataResponse)
async def get_ticker_data(ticker: str):
    """Get current market data for a ticker"""
    data = market_service.get_ticker_data(ticker)
    
    if data.get("current_price") == 0:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")
    
    return {
        "ticker": data["ticker"],
        "current_price": data["current_price"],
        "price_change_24h": data["price_change_24h"],
        "volume_24h": data["volume_24h"],
        "volume_change_24h": data["volume_change_24h"],
        "market_cap": data.get("market_cap"),
        "last_updated": data["last_updated"]
    }


@router.get("/trends", response_model=List[dict])
async def get_market_trends(
    tickers: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Detect market trends for tickers"""
    if tickers:
        ticker_list = [t.strip() for t in tickers.split(",")]
    else:
        # Get tickers from recent posts
        from datetime import datetime, timedelta, timezone
        yesterday = datetime.now(timezone.utc) - timedelta(days=1)
        recent_posts = db.query(models.Post).filter(
            models.Post.created_at >= yesterday
        ).all()
        ticker_list = list(set([p.ticker for p in recent_posts if p.ticker]))
    
    trends = market_service.detect_market_trends(ticker_list)
    
    return [
        {
            "ticker": t["ticker"],
            "trend_type": t["trend_type"],
            "magnitude": t["magnitude"],
            "detected_at": t["detected_at"].isoformat() if hasattr(t["detected_at"], "isoformat") else str(t["detected_at"]),
            "metadata": t["metadata"]
        }
        for t in trends
    ]

