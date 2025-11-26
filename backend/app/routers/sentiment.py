"""
Sentiment router for social sentiment data from StockTwits
Research shows sentiment can enhance short-term predictions
Reference: https://arxiv.org/html/2411.00856v1
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.services.stocktwits_service import StockTwitsService

router = APIRouter()
stocktwits_service = StockTwitsService()


@router.get("/stocktwits/batch")
async def get_batch_sentiment(tickers: str):
    """Get sentiment for multiple tickers (comma-separated)"""
    ticker_list = [t.strip().upper() for t in tickers.split(",")]
    sentiments = stocktwits_service.get_multiple_sentiments(ticker_list)
    # Return the dict directly - handles partial failures gracefully
    return sentiments


@router.get("/stocktwits/{ticker}")
async def get_stocktwits_sentiment(ticker: str):
    """Get StockTwits sentiment for a ticker"""
    sentiment = stocktwits_service.get_sentiment(ticker)
    
    if sentiment.get("total_messages", 0) == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No sentiment data available for {ticker}. Ensure STOCKTWITS_API_KEY is set for full access."
        )
    
    return sentiment

