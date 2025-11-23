"""
LLM service for content analysis, tagging, and ranking
"""
import json
import time
from typing import List, Dict, Any, Optional
from openai import OpenAI
from app.config import settings
import httpx


class LLMService:
    """Service for LLM-powered content analysis and ranking"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.temperature = settings.LLM_TEMPERATURE
    
    def analyze_post(
        self,
        title: str,
        content: str,
        ticker: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze a post and extract semantic tags, summary, quality score, etc.
        Fixed latency/compute budget approach.
        """
        prompt = self._build_analysis_prompt(title, content, ticker)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert financial analyst assistant that extracts structured insights from stock analysis posts."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return {
                "summary": result.get("summary", ""),
                "quality_score": float(result.get("quality_score", 0.0)),
                "semantic_tags": result.get("semantic_tags", []),
                "sector": result.get("sector"),
                "catalyst_type": result.get("catalyst_type"),
                "risk_profile": result.get("risk_profile", "moderate"),
                "insight_type": result.get("insight_type"),
                "key_points": result.get("key_points", []),
                "forward_looking": result.get("forward_looking", False),
                "fundamental_focus": result.get("fundamental_focus", False)
            }
        except Exception as e:
            # Fallback to basic analysis
            return self._fallback_analysis(title, content, ticker)
    
    def _build_analysis_prompt(self, title: str, content: str, ticker: Optional[str]) -> str:
        """
        Build prompt for post analysis.
        Enhanced based on research showing fundamentals enhance ratings accuracy.
        Reference: https://arxiv.org/html/2411.00856v1
        """
        return f"""Analyze the following stock analysis post and extract structured information.
Use financial analysis best practices: evaluate fundamentals, consider forward projections,
assess market conditions, and identify key catalysts.

Title: {title}
Content: {content}
Ticker: {ticker or "Not specified"}

Return a JSON object with the following structure:
{{
    "summary": "Brief 2-3 sentence summary focusing on key investment thesis",
    "quality_score": 0.0-100.0 (based on: analytical depth, use of fundamentals, 
        clarity of reasoning, evidence quality, forward-looking perspective, originality),
    "semantic_tags": ["sector:tech", "catalyst:earnings", "risk:high", "fundamental:strong", etc.],
    "sector": "Technology/Healthcare/Finance/etc or null",
    "catalyst_type": "earnings/merger/news/technical/fundamental/etc or null",
    "risk_profile": "low/moderate/high",
    "insight_type": "fundamental_analysis/technical_analysis/macro_commentary/earnings_forecast/risk_warning",
    "key_points": ["point1", "point2", "point3"],
    "forward_looking": true/false (does analysis project future performance),
    "fundamental_focus": true/false (does analysis emphasize fundamentals)
}}

Focus on accuracy and be concise. Quality score should reflect analytical depth, 
use of fundamentals, and forward-looking perspective. Higher scores for analyses 
that incorporate fundamental data and forward projections."""
    
    def _fallback_analysis(self, title: str, content: str, ticker: Optional[str]) -> Dict[str, Any]:
        """Fallback analysis when LLM fails"""
        return {
            "summary": f"{title}: {content[:200]}...",
            "quality_score": 50.0,
            "semantic_tags": [],
            "sector": None,
            "catalyst_type": None,
            "risk_profile": "moderate",
            "insight_type": "macro_commentary",
            "key_points": [],
            "forward_looking": False,
            "fundamental_focus": False
        }
    
    def rank_posts(
        self,
        posts: List[Dict[str, Any]],
        user_preferences: Optional[Dict[str, Any]] = None,
        market_context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Rank posts for personalized feed using ensemble approach.
        Balances quality, diversity, relevance, and timeliness.
        """
        if not posts:
            return []
        
        # Calculate scores for each post
        scored_posts = []
        for post in posts:
            score = self._calculate_post_score(post, user_preferences, market_context)
            scored_posts.append({**post, "ranking_score": score})
        
        # Sort by ranking score
        ranked = sorted(scored_posts, key=lambda x: x["ranking_score"], reverse=True)
        
        # Apply diversity boost (ensure variety in top results)
        ranked = self._apply_diversity_boost(ranked)
        
        return ranked
    
    def _calculate_post_score(
        self,
        post: Dict[str, Any],
        user_preferences: Optional[Dict[str, Any]],
        market_context: Optional[Dict[str, Any]]
    ) -> float:
        """Calculate ensemble ranking score"""
        score = 0.0
        
        # Base quality score (0-100) -> normalized to 0-40
        quality_score = post.get("quality_score", 0.0)
        score += (quality_score / 100.0) * 40
        
        # Engagement signals (0-20)
        engagement = (
            post.get("like_count", 0) * 0.5 +
            post.get("helpful_count", 0) * 1.0 +
            post.get("bullish_count", 0) * 0.3 +
            post.get("bearish_count", 0) * 0.3 -
            post.get("dislike_count", 0) * 0.5
        )
        score += min(engagement / 10.0, 20.0)
        
        # Author reputation (0-15)
        author_reputation = post.get("author_reputation_score", 0.0)
        score += min(author_reputation / 10.0, 15.0)
        
        # User preference match (0-15)
        if user_preferences:
            preference_score = self._calculate_preference_match(post, user_preferences)
            score += preference_score * 15
        
        # Market relevance (0-10)
        if market_context:
            market_score = self._calculate_market_relevance(post, market_context)
            score += market_score * 10
        
        # Recency boost (0-5)
        recency_score = self._calculate_recency_score(post)
        score += recency_score * 5
        
        return score
    
    def _calculate_preference_match(
        self,
        post: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> float:
        """Calculate how well post matches user preferences"""
        match = 0.0
        
        # Sector match
        if post.get("sector") in preferences.get("preferred_sectors", []):
            match += 0.4
        
        # Insight type match
        if post.get("insight_type") in preferences.get("preferred_insight_types", []):
            match += 0.3
        
        # Ticker match
        if post.get("ticker") in preferences.get("followed_tickers", []):
            match += 0.3
        
        return min(match, 1.0)
    
    def _calculate_market_relevance(
        self,
        post: Dict[str, Any],
        market_context: Dict[str, Any]
    ) -> float:
        """
        Calculate relevance based on current market conditions.
        Enhanced with sentiment data (research shows sentiment improves short-term performance).
        """
        relevance = 0.0
        ticker = post.get("ticker")
        
        if not ticker:
            return 0.0
        
        ticker_data = market_context.get("tickers", {}).get(ticker, {})
        
        # Volume spike boost
        if ticker_data.get("volume_spike", False):
            relevance += 0.3
        
        # Price movement boost
        price_change = abs(ticker_data.get("price_change_24h", 0))
        if price_change > 0.05:  # >5% move
            relevance += 0.25
        
        # Earnings release boost
        if ticker_data.get("earnings_release", False):
            relevance += 0.2
        
        # Social sentiment boost (research shows sentiment enhances short-term predictions)
        sentiment_score = abs(ticker_data.get("social_sentiment", 0))
        if sentiment_score > 0.3:  # Strong sentiment (>30% bullish or bearish)
            relevance += 0.15
        
        # Fundamental data boost (research shows fundamentals enhance accuracy)
        if ticker_data.get("fundamentals", {}):
            fundamentals = ticker_data.get("fundamentals", {})
            if fundamentals.get("revenue_growth") or fundamentals.get("earnings_growth"):
                relevance += 0.1
        
        return min(relevance, 1.0)
    
    def _calculate_recency_score(self, post: Dict[str, Any]) -> float:
        """Calculate recency boost (newer posts get higher score)"""
        from datetime import datetime, timezone
        created_at = post.get("created_at")
        
        if not created_at:
            return 0.0
        
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        hours_old = (now - created_at).total_seconds() / 3600
        
        # Exponential decay: 1.0 for posts < 1 hour old, ~0.1 for posts > 48 hours old
        if hours_old < 1:
            return 1.0
        elif hours_old < 24:
            return 0.5
        elif hours_old < 48:
            return 0.2
        else:
            return 0.1
    
    def _apply_diversity_boost(self, ranked_posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply diversity boost to ensure variety in top results"""
        if len(ranked_posts) <= 5:
            return ranked_posts
        
        # Boost posts with different tickers/sectors in top 10
        seen_tickers = set()
        seen_sectors = set()
        
        for i, post in enumerate(ranked_posts[:10]):
            ticker = post.get("ticker")
            sector = post.get("sector")
            
            if ticker and ticker not in seen_tickers:
                post["ranking_score"] += 2.0
                seen_tickers.add(ticker)
            
            if sector and sector not in seen_sectors:
                post["ranking_score"] += 1.0
                seen_sectors.add(sector)
        
        # Re-sort after diversity boost
        return sorted(ranked_posts, key=lambda x: x["ranking_score"], reverse=True)
    
    def generate_explanation(
        self,
        post: Dict[str, Any],
        user_id: Optional[int] = None,
        ranking_score: float = 0.0
    ) -> str:
        """Generate natural language explanation for why a post is recommended"""
        factors = []
        
        if post.get("quality_score", 0) > 70:
            factors.append("high-quality analysis")
        
        if post.get("author_reputation_score", 0) > 50:
            factors.append("reputable author")
        
        if post.get("like_count", 0) > 10:
            factors.append("strong community engagement")
        
        if post.get("helpful_count", 0) > 5:
            factors.append("marked as helpful by users")
        
        ticker = post.get("ticker")
        if ticker:
            factors.append(f"relevant to {ticker}")
        
        sector = post.get("sector")
        if sector:
            factors.append(f"covers {sector} sector")
        
        if not factors:
            factors.append("relevant content")
        
        explanation = f"This post is recommended because it features {', '.join(factors[:3])}."
        
        return explanation
    
    def detect_trends(
        self,
        posts: List[Dict[str, Any]],
        market_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect market and community trends"""
        trends = []
        
        # Count ticker mentions
        ticker_counts = {}
        ticker_sentiment = {}
        
        for post in posts:
            ticker = post.get("ticker")
            if ticker:
                ticker_counts[ticker] = ticker_counts.get(ticker, 0) + 1
                # Aggregate sentiment
                bullish = post.get("bullish_count", 0)
                bearish = post.get("bearish_count", 0)
                if bullish + bearish > 0:
                    sentiment = (bullish - bearish) / (bullish + bearish)
                    ticker_sentiment[ticker] = ticker_sentiment.get(ticker, 0) + sentiment
        
        # Identify trending tickers
        for ticker, count in sorted(ticker_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            trends.append({
                "type": "trending_ticker",
                "ticker": ticker,
                "post_count": count,
                "sentiment": ticker_sentiment.get(ticker, 0) / count if count > 0 else 0,
                "market_data": market_data.get("tickers", {}).get(ticker, {})
            })
        
        return trends

