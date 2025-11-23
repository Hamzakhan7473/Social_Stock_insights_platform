"""
Market data service for live price movements, volume spikes, and earnings releases
Enhanced with fundamental data based on research showing fundamentals enhance ratings accuracy
Reference: https://arxiv.org/html/2411.00856v1
"""
import yfinance as yf
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
import httpx
from app.config import settings


class MarketDataService:
    """Service for fetching and processing live market data"""
    
    def __init__(self):
        self.provider = settings.MARKET_DATA_PROVIDER
        self.api_key = settings.MARKET_DATA_API_KEY
    
    def get_ticker_data(self, ticker: str) -> Dict[str, Any]:
        """
        Get current market data for a ticker with fundamental data.
        Research shows fundamentals enhance ratings accuracy.
        """
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            # Get recent price data
            hist = stock.history(period="2d")
            
            if hist.empty:
                return self._empty_ticker_data(ticker)
            
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            price_change_24h = ((current_price - prev_close) / prev_close) * 100
            
            current_volume = hist['Volume'].iloc[-1]
            prev_volume = hist['Volume'].iloc[-2] if len(hist) > 1 else current_volume
            volume_change_24h = ((current_volume - prev_volume) / prev_volume) * 100 if prev_volume > 0 else 0
            
            # Detect volume spike (>50% increase)
            volume_spike = volume_change_24h > 50
            
            # Detect significant price movement (>5%)
            significant_move = abs(price_change_24h) > 5
            
            # Extract fundamental data (research shows this enhances accuracy)
            fundamentals = self._extract_fundamentals(info)
            
            return {
                "ticker": ticker,
                "current_price": float(current_price),
                "price_change_24h": float(price_change_24h),
                "volume_24h": float(current_volume),
                "volume_change_24h": float(volume_change_24h),
                "volume_spike": volume_spike,
                "significant_move": significant_move,
                "market_cap": info.get("marketCap"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "earnings_release": self._check_earnings_release(stock),
                "fundamentals": fundamentals,  # Added based on research
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")
            return self._empty_ticker_data(ticker)
    
    def _extract_fundamentals(self, info: Dict) -> Dict[str, Any]:
        """
        Extract fundamental financial metrics.
        Research shows fundamentals enhance stock rating accuracy.
        """
        return {
            "revenue_growth": info.get("revenueGrowth"),
            "earnings_growth": info.get("earningsGrowth"),
            "profit_margin": info.get("profitMargins"),
            "debt_to_equity": info.get("debtToEquity"),
            "return_on_equity": info.get("returnOnEquity"),
            "price_to_earnings": info.get("trailingPE"),
            "price_to_book": info.get("priceToBook"),
            "enterprise_value": info.get("enterpriseValue"),
            "free_cash_flow": info.get("freeCashflow"),
            "revenue": info.get("totalRevenue"),
            "earnings_per_share": info.get("trailingEps"),
        }
    
    def _empty_ticker_data(self, ticker: str) -> Dict[str, Any]:
        """Return empty data structure for failed requests"""
        return {
            "ticker": ticker,
            "current_price": 0.0,
            "price_change_24h": 0.0,
            "volume_24h": 0.0,
            "volume_change_24h": 0.0,
            "volume_spike": False,
            "significant_move": False,
            "market_cap": None,
            "sector": None,
            "industry": None,
            "earnings_release": False,
            "fundamentals": {},
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    
    def _check_earnings_release(self, stock: yf.Ticker) -> bool:
        """Check if there's a recent earnings release"""
        try:
            calendar = stock.calendar
            if calendar is not None and not calendar.empty:
                # Check if earnings date is within last 7 days
                earnings_dates = calendar.index
                if len(earnings_dates) > 0:
                    latest_earnings = earnings_dates[-1]
                    if isinstance(latest_earnings, datetime):
                        days_ago = (datetime.now(timezone.utc) - latest_earnings.replace(tzinfo=timezone.utc)).days
                        return days_ago <= 7
            return False
        except:
            return False
    
    def get_multiple_tickers(self, tickers: List[str]) -> Dict[str, Dict[str, Any]]:
        """Get data for multiple tickers"""
        result = {}
        for ticker in tickers:
            result[ticker] = self.get_ticker_data(ticker)
        return result
    
    def get_market_context(
        self,
        tickers: Optional[List[str]] = None,
        include_sentiment: bool = True
    ) -> Dict[str, Any]:
        """
        Get market context for ranking and trend detection.
        Optionally includes social sentiment (research shows sentiment improves short-term performance).
        """
        if not tickers:
            tickers = []
        
        ticker_data = self.get_multiple_tickers(tickers)
        
        # Add social sentiment if available
        if include_sentiment:
            try:
                from app.services.stocktwits_service import StockTwitsService
                stocktwits = StockTwitsService()
                sentiments = stocktwits.get_multiple_sentiments(tickers)
                
                # Merge sentiment into ticker data
                for ticker in tickers:
                    if ticker in ticker_data and ticker in sentiments:
                        ticker_data[ticker]["social_sentiment"] = sentiments[ticker].get("sentiment_score", 0.0)
                        ticker_data[ticker]["social_bullish"] = sentiments[ticker].get("bullish_count", 0)
                        ticker_data[ticker]["social_bearish"] = sentiments[ticker].get("bearish_count", 0)
            except Exception as e:
                print(f"Could not fetch social sentiment: {e}")
        
        return {
            "tickers": ticker_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def detect_market_trends(self, tickers: List[str]) -> List[Dict[str, Any]]:
        """Detect market trends from ticker data"""
        trends = []
        ticker_data = self.get_multiple_tickers(tickers)
        
        for ticker, data in ticker_data.items():
            trend = None
            
            if data.get("volume_spike"):
                trend = {
                    "ticker": ticker,
                    "trend_type": "volume_spike",
                    "magnitude": data.get("volume_change_24h", 0),
                    "detected_at": datetime.now(timezone.utc),
                    "metadata": {
                        "volume_change": data.get("volume_change_24h"),
                        "current_price": data.get("current_price")
                    }
                }
            elif data.get("significant_move"):
                trend = {
                    "ticker": ticker,
                    "trend_type": "price_movement",
                    "magnitude": abs(data.get("price_change_24h", 0)),
                    "detected_at": datetime.now(timezone.utc),
                    "metadata": {
                        "price_change": data.get("price_change_24h"),
                        "current_price": data.get("current_price")
                    }
                }
            elif data.get("earnings_release"):
                trend = {
                    "ticker": ticker,
                    "trend_type": "earnings_release",
                    "magnitude": 1.0,
                    "detected_at": datetime.now(timezone.utc),
                    "metadata": {
                        "current_price": data.get("current_price")
                    }
                }
            
            if trend:
                trends.append(trend)
        
        return trends

