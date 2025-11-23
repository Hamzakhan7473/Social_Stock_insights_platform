"""
Trend detection for market and community patterns
"""
from typing import List, Dict, Any
from collections import Counter


class TrendDetector:
    """Detects trends in posts and market data"""
    
    def detect_community_trends(
        self,
        posts: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Detect community trends from posts.
        
        Returns:
            List of trend dictionaries with type, ticker, magnitude, etc.
        """
        trends = []
        
        # Ticker mentions
        ticker_counts = Counter()
        ticker_sentiment = {}
        
        for post in posts:
            ticker = post.get("ticker")
            if ticker:
                ticker_counts[ticker] += 1
                
                # Aggregate sentiment
                bullish = post.get("bullish_count", 0)
                bearish = post.get("bearish_count", 0)
                if bullish + bearish > 0:
                    sentiment = (bullish - bearish) / (bullish + bearish)
                    if ticker not in ticker_sentiment:
                        ticker_sentiment[ticker] = []
                    ticker_sentiment[ticker].append(sentiment)
        
        # Create trend entries
        for ticker, count in ticker_counts.most_common(10):
            avg_sentiment = (
                sum(ticker_sentiment.get(ticker, [])) / len(ticker_sentiment.get(ticker, [1]))
                if ticker_sentiment.get(ticker)
                else 0
            )
            
            trends.append({
                "type": "trending_ticker",
                "ticker": ticker,
                "post_count": count,
                "sentiment": avg_sentiment,
                "magnitude": count
            })
        
        return trends
    
    def detect_sector_trends(
        self,
        posts: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Detect trending sectors"""
        sector_counts = Counter()
        
        for post in posts:
            sector = post.get("sector")
            if sector:
                sector_counts[sector] += 1
        
        trends = []
        for sector, count in sector_counts.most_common(5):
            trends.append({
                "type": "trending_sector",
                "sector": sector,
                "post_count": count,
                "magnitude": count
            })
        
        return trends
    
    def detect_insight_type_trends(
        self,
        posts: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Detect trending insight types"""
        type_counts = Counter()
        
        for post in posts:
            insight_type = post.get("insight_type")
            if insight_type:
                type_counts[insight_type] += 1
        
        trends = []
        for insight_type, count in type_counts.most_common():
            trends.append({
                "type": "trending_insight_type",
                "insight_type": insight_type,
                "post_count": count,
                "magnitude": count
            })
        
        return trends

