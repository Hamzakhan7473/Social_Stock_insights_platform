"""
Ranking engine for personalized feed generation with ensemble signal aggregation
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone


class RankingEngine:
    """
    Ranks posts using ensemble approach balancing:
    - Quality scores
    - Engagement signals
    - Author reputation
    - User preferences
    - Market relevance
    - Recency
    - Diversity
    """
    
    def __init__(
        self,
        quality_weight: float = 0.4,
        engagement_weight: float = 0.2,
        reputation_weight: float = 0.15,
        preference_weight: float = 0.15,
        market_weight: float = 0.1
    ):
        self.quality_weight = quality_weight
        self.engagement_weight = engagement_weight
        self.reputation_weight = reputation_weight
        self.preference_weight = preference_weight
        self.market_weight = market_weight
    
    def rank(
        self,
        posts: List[Dict[str, Any]],
        user_preferences: Optional[Dict[str, Any]] = None,
        market_context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Rank posts for personalized feed.
        
        Args:
            posts: List of post dictionaries
            user_preferences: User preference dict
            market_context: Market data context
            
        Returns:
            Ranked list of posts with ranking_score added
        """
        if not posts:
            return []
        
        # Score each post
        scored_posts = []
        for post in posts:
            score = self._calculate_score(post, user_preferences, market_context)
            scored_posts.append({**post, "ranking_score": score})
        
        # Sort by score
        ranked = sorted(scored_posts, key=lambda x: x["ranking_score"], reverse=True)
        
        # Apply diversity boost
        ranked = self._apply_diversity(ranked)
        
        return ranked
    
    def _calculate_score(
        self,
        post: Dict[str, Any],
        user_preferences: Optional[Dict[str, Any]],
        market_context: Optional[Dict[str, Any]]
    ) -> float:
        """Calculate ensemble ranking score"""
        score = 0.0
        
        # Quality (0-40)
        quality = post.get("quality_score", 0.0) / 100.0
        score += quality * 40 * self.quality_weight
        
        # Engagement (0-20)
        engagement = self._calculate_engagement(post)
        score += engagement * 20 * self.engagement_weight
        
        # Reputation (0-15)
        reputation = min(post.get("author_reputation_score", 0.0) / 100.0, 1.0)
        score += reputation * 15 * self.reputation_weight
        
        # Preferences (0-15)
        if user_preferences:
            preference_match = self._calculate_preference_match(post, user_preferences)
            score += preference_match * 15 * self.preference_weight
        
        # Market relevance (0-10)
        if market_context:
            market_relevance = self._calculate_market_relevance(post, market_context)
            score += market_relevance * 10 * self.market_weight
        
        return score
    
    def _calculate_engagement(self, post: Dict[str, Any]) -> float:
        """Calculate engagement score"""
        engagement = (
            post.get("like_count", 0) * 0.5 +
            post.get("helpful_count", 0) * 1.0 +
            post.get("bullish_count", 0) * 0.3 +
            post.get("bearish_count", 0) * 0.3 -
            post.get("dislike_count", 0) * 0.5
        )
        return min(engagement / 10.0, 1.0)
    
    def _calculate_preference_match(
        self,
        post: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> float:
        """Calculate preference match score"""
        match = 0.0
        
        if post.get("sector") in preferences.get("preferred_sectors", []):
            match += 0.4
        if post.get("insight_type") in preferences.get("preferred_insight_types", []):
            match += 0.3
        if post.get("ticker") in preferences.get("followed_tickers", []):
            match += 0.3
        
        return min(match, 1.0)
    
    def _calculate_market_relevance(
        self,
        post: Dict[str, Any],
        market_context: Dict[str, Any]
    ) -> float:
        """Calculate market relevance score"""
        ticker = post.get("ticker")
        if not ticker:
            return 0.0
        
        ticker_data = market_context.get("tickers", {}).get(ticker, {})
        relevance = 0.0
        
        if ticker_data.get("volume_spike"):
            relevance += 0.4
        if abs(ticker_data.get("price_change_24h", 0)) > 5:
            relevance += 0.3
        if ticker_data.get("earnings_release"):
            relevance += 0.3
        
        return min(relevance, 1.0)
    
    def _apply_diversity(self, ranked: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply diversity boost to ensure variety"""
        if len(ranked) <= 5:
            return ranked
        
        seen_tickers = set()
        seen_sectors = set()
        
        for i, post in enumerate(ranked[:10]):
            ticker = post.get("ticker")
            sector = post.get("sector")
            
            if ticker and ticker not in seen_tickers:
                post["ranking_score"] += 2.0
                seen_tickers.add(ticker)
            
            if sector and sector not in seen_sectors:
                post["ranking_score"] += 1.0
                seen_sectors.add(sector)
        
        return sorted(ranked, key=lambda x: x["ranking_score"], reverse=True)

