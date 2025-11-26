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
        market_context: Optional[Dict[str, Any]] = None,
        strategy: str = "balanced"
    ) -> List[Dict[str, Any]]:
        """
        Rank posts for personalized feed using ensemble approach.
        Balances quality, diversity, relevance, and timeliness.
        
        Strategies:
        - "balanced": Equal weight to all signals (default)
        - "quality_focused": Prioritize high-quality analysis
        - "trending": Prioritize market relevance and timeliness
        - "diverse": Maximize diversity across tickers/sectors
        - "expert": Prioritize high-reputation authors
        """
        if not posts:
            return []
        
        # Calculate scores for each post with strategy
        scored_posts = []
        for post in posts:
            score = self._calculate_post_score(
                post, 
                user_preferences, 
                market_context,
                strategy=strategy
            )
            scored_posts.append({**post, "ranking_score": score})
        
        # Sort by ranking score
        ranked = sorted(scored_posts, key=lambda x: x["ranking_score"], reverse=True)
        
        # Apply diversity boost (ensure variety in top results)
        if strategy != "diverse":
            ranked = self._apply_diversity_boost(ranked)
        else:
            # For diverse strategy, apply stronger diversity boost
            ranked = self._apply_diversity_boost(ranked, boost_multiplier=2.0)
        
        return ranked
    
    def experiment_with_strategy(
        self,
        posts: List[Dict[str, Any]],
        user_preferences: Optional[Dict[str, Any]] = None,
        market_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Experiment with different ranking strategies and return results.
        Allows LLM to experiment with strategies that balance insight quality, 
        diversity, and real-time responsiveness.
        """
        strategies = ["balanced", "quality_focused", "trending", "diverse", "expert"]
        results = {}
        
        for strategy in strategies:
            ranked = self.rank_posts(
                posts.copy(),
                user_preferences,
                market_context,
                strategy=strategy
            )
            results[strategy] = ranked[:10]  # Top 10 for each strategy
        
        return results
    
    def _calculate_post_score(
        self,
        post: Dict[str, Any],
        user_preferences: Optional[Dict[str, Any]],
        market_context: Optional[Dict[str, Any]],
        strategy: str = "balanced"
    ) -> float:
        """
        Calculate ensemble ranking score with configurable strategy.
        Implements simple ensemble-style signal aggregation blending:
        - Community sentiment
        - Historical accuracy (via reputation)
        - Expert-tagged insights (via quality scores)
        """
        # Strategy weights
        weights = {
            "balanced": {
                "quality": 40, "engagement": 20, "reputation": 15,
                "preference": 15, "market": 10, "recency": 5
            },
            "quality_focused": {
                "quality": 60, "engagement": 10, "reputation": 15,
                "preference": 10, "market": 5, "recency": 5
            },
            "trending": {
                "quality": 25, "engagement": 15, "reputation": 10,
                "preference": 10, "market": 30, "recency": 10
            },
            "diverse": {
                "quality": 30, "engagement": 20, "reputation": 10,
                "preference": 20, "market": 10, "recency": 10
            },
            "expert": {
                "quality": 35, "engagement": 10, "reputation": 35,
                "preference": 10, "market": 5, "recency": 5
            }
        }
        
        w = weights.get(strategy, weights["balanced"])
        score = 0.0
        
        # Base quality score (0-100) -> normalized
        quality_score = post.get("quality_score", 0.0)
        score += (quality_score / 100.0) * w["quality"]
        
        # Engagement signals (community sentiment)
        engagement = (
            post.get("like_count", 0) * 0.5 +
            post.get("helpful_count", 0) * 1.0 +
            post.get("bullish_count", 0) * 0.3 +
            post.get("bearish_count", 0) * 0.3 -
            post.get("dislike_count", 0) * 0.5
        )
        score += min(engagement / 10.0, w["engagement"])
        
        # Author reputation (historical accuracy proxy)
        author_reputation = post.get("author_reputation_score", 0.0)
        score += min(author_reputation / 10.0, w["reputation"])
        
        # User preference match
        if user_preferences:
            preference_score = self._calculate_preference_match(post, user_preferences)
            score += preference_score * w["preference"]
        
        # Market relevance (real-time responsiveness)
        if market_context:
            market_score = self._calculate_market_relevance(post, market_context)
            score += market_score * w["market"]
        
        # Recency boost (timeliness)
        recency_score = self._calculate_recency_score(post)
        score += recency_score * (w["recency"] / 5.0) * 5
        
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
    
    def _apply_diversity_boost(
        self, 
        ranked_posts: List[Dict[str, Any]], 
        boost_multiplier: float = 1.0
    ) -> List[Dict[str, Any]]:
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
                post["ranking_score"] += 2.0 * boost_multiplier
                seen_tickers.add(ticker)
            
            if sector and sector not in seen_sectors:
                post["ranking_score"] += 1.0 * boost_multiplier
                seen_sectors.add(sector)
        
        # Re-sort after diversity boost
        return sorted(ranked_posts, key=lambda x: x["ranking_score"], reverse=True)
    
    def generate_explanation(
        self,
        post: Dict[str, Any],
        user_id: Optional[int] = None,
        ranking_score: float = 0.0,
        market_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate natural language explanation for why a post is recommended.
        Uses LLM to create transparent, contextual explanations.
        """
        # Build context for explanation
        quality_score = post.get("quality_score", 0.0)
        author_reputation = post.get("author_reputation_score", 0.0)
        like_count = post.get("like_count", 0)
        helpful_count = post.get("helpful_count", 0)
        ticker = post.get("ticker")
        sector = post.get("sector")
        insight_type = post.get("insight_type")
        
        # Market context if available
        market_info = ""
        if market_context and ticker:
            ticker_data = market_context.get("tickers", {}).get(ticker, {})
            if ticker_data:
                price_change = ticker_data.get("price_change_24h", 0)
                volume_spike = ticker_data.get("volume_spike", False)
                earnings_release = ticker_data.get("earnings_release", False)
                
                market_info = f"\n\nCurrent market context for {ticker}:"
                if price_change:
                    market_info += f" Price change: {price_change:.2f}%"
                if volume_spike:
                    market_info += " Volume spike detected"
                if earnings_release:
                    market_info += " Recent earnings release"
        
        prompt = f"""Explain why this stock analysis post is recommended to a user. 
Be transparent, concise (2-3 sentences), and highlight the key factors that make this post valuable.

Post Title: {post.get('title', 'N/A')}
Post Summary: {post.get('summary', post.get('content', '')[:200])}
Quality Score: {quality_score}/100
Author Reputation: {author_reputation}/100
Engagement: {like_count} likes, {helpful_count} helpful marks
Sector: {sector or 'N/A'}
Insight Type: {insight_type or 'N/A'}
Ranking Score: {ranking_score:.2f}{market_info}

Generate a natural, conversational explanation that helps the user understand why this post is recommended. 
Focus on what makes it valuable: analytical quality, author credibility, community validation, market relevance, or timeliness.
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that explains content recommendations in a clear, transparent way."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            explanation = response.choices[0].message.content.strip()
            return explanation
        except Exception as e:
            # Fallback to rule-based explanation
            print(f"Error generating LLM explanation: {e}")
            factors = []
            
            if quality_score > 70:
                factors.append("high-quality analysis")
            
            if author_reputation > 50:
                factors.append("reputable author")
            
            if like_count > 10:
                factors.append("strong community engagement")
            
            if helpful_count > 5:
                factors.append("marked as helpful by users")
            
            if ticker:
                factors.append(f"relevant to {ticker}")
            
            if not factors:
                factors.append("relevant content")
            
            return f"This post is recommended because it features {', '.join(factors[:3])}."
    
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

