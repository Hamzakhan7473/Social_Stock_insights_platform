"""
StockTwits sentiment service for social sentiment data
Based on research showing sentiment can enhance short-term predictions
Reference: https://arxiv.org/html/2411.00856v1
"""
import httpx
from typing import Dict, Optional, Any
from datetime import datetime, timezone
from app.config import settings


class StockTwitsService:
    """
    Service for fetching StockTwits sentiment data.
    Research shows sentiment scores can improve short-term performance
    without requiring full news summaries (reducing token usage).
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'STOCKTWITS_API_KEY', None)
        self.base_url = "https://stocktwits.com/api/2"
        self.rapidapi_url = "https://stocktwits-api.p.rapidapi.com"
        self.use_rapidapi = self.api_key is not None
    
    def get_sentiment(self, ticker: str) -> Dict[str, Any]:
        """
        Get sentiment data for a ticker from StockTwits.
        Returns aggregated sentiment score and message count.
        """
        if not self.use_rapidapi:
            # Fallback to public API (limited)
            return self._get_sentiment_public(ticker)
        
        return self._get_sentiment_rapidapi(ticker)
    
    def _get_sentiment_rapidapi(self, ticker: str) -> Dict[str, Any]:
        """Get sentiment using RapidAPI StockTwits API"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.rapidapi_url}/sentiment/{ticker}",
                    headers={
                        "X-RapidAPI-Key": self.api_key,
                        "X-RapidAPI-Host": "stocktwits-api.p.rapidapi.com"
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_sentiment_response(data, ticker)
        except Exception as e:
            print(f"Error fetching StockTwits sentiment for {ticker}: {e}")
        
        return self._empty_sentiment(ticker)
    
    def _get_sentiment_public(self, ticker: str) -> Dict[str, Any]:
        """Get sentiment using public StockTwits API (limited functionality)"""
        try:
            with httpx.Client() as client:
                # Get stream for ticker
                response = client.get(
                    f"{self.base_url}/streams/symbol/{ticker}.json",
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_stream_response(data, ticker)
        except Exception as e:
            print(f"Error fetching StockTwits stream for {ticker}: {e}")
        
        return self._empty_sentiment(ticker)
    
    def _parse_sentiment_response(self, data: Dict, ticker: str) -> Dict[str, Any]:
        """Parse RapidAPI sentiment response"""
        # Adjust based on actual API response structure
        bullish = data.get("bullish", 0)
        bearish = data.get("bearish", 0)
        total = bullish + bearish
        
        sentiment_score = 0.0
        if total > 0:
            sentiment_score = (bullish - bearish) / total
        
        return {
            "ticker": ticker,
            "sentiment_score": sentiment_score,
            "bullish_count": bullish,
            "bearish_count": bearish,
            "total_messages": data.get("total", total),
            "source": "stocktwits",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    
    def _parse_stream_response(self, data: Dict, ticker: str) -> Dict[str, Any]:
        """Parse public API stream response"""
        messages = data.get("messages", [])
        
        bullish = 0
        bearish = 0
        
        for message in messages:
            sentiment = message.get("sentiment", {})
            if sentiment:
                if sentiment.get("class") == "bullish":
                    bullish += 1
                elif sentiment.get("class") == "bearish":
                    bearish += 1
        
        total = bullish + bearish
        sentiment_score = 0.0
        if total > 0:
            sentiment_score = (bullish - bearish) / total
        
        return {
            "ticker": ticker,
            "sentiment_score": sentiment_score,
            "bullish_count": bullish,
            "bearish_count": bearish,
            "total_messages": len(messages),
            "source": "stocktwits",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    
    def _empty_sentiment(self, ticker: str) -> Dict[str, Any]:
        """Return empty sentiment structure"""
        return {
            "ticker": ticker,
            "sentiment_score": 0.0,
            "bullish_count": 0,
            "bearish_count": 0,
            "total_messages": 0,
            "source": "stocktwits",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    
    def get_multiple_sentiments(self, tickers: list[str]) -> Dict[str, Dict[str, Any]]:
        """Get sentiment for multiple tickers"""
        results = {}
        for ticker in tickers:
            results[ticker] = self.get_sentiment(ticker)
        return results

