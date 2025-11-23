"""
Reputation scoring service for users
"""
from typing import Dict, Any
from datetime import datetime, timedelta, timezone
from app.config import settings


class ReputationService:
    """Service for calculating and updating user reputation scores"""
    
    def __init__(self):
        self.decay_factor = settings.REPUTATION_DECAY_FACTOR
        self.min_for_verified = settings.MIN_REPUTATION_FOR_VERIFIED
    
    def calculate_reputation(
        self,
        user_id: int,
        posts: list,
        reactions_received: Dict[str, int]
    ) -> float:
        """
        Calculate reputation score based on:
        - Post quality scores
        - Engagement received (likes, helpful marks)
        - Historical accuracy (if tracked)
        - Recency weighting
        """
        reputation = 0.0
        
        # Base reputation from post quality
        for post in posts:
            quality_score = post.get("quality_score", 0.0)
            post_age_days = self._get_post_age_days(post.get("created_at"))
            
            # Apply recency decay
            recency_weight = self._calculate_recency_weight(post_age_days)
            reputation += (quality_score / 100.0) * 10 * recency_weight
        
        # Engagement boost
        likes = reactions_received.get("like", 0)
        helpful = reactions_received.get("helpful", 0)
        bullish = reactions_received.get("bullish", 0)
        
        engagement_score = (
            likes * 0.5 +
            helpful * 2.0 +
            bullish * 0.3
        )
        reputation += min(engagement_score / 10.0, 50.0)
        
        # Apply decay for older contributions
        oldest_post_days = min([self._get_post_age_days(p.get("created_at")) for p in posts] or [0])
        if oldest_post_days > 30:
            decay = self.decay_factor ** (oldest_post_days / 30)
            reputation *= decay
        
        return max(0.0, min(100.0, reputation))
    
    def _get_post_age_days(self, created_at: Any) -> float:
        """Get age of post in days"""
        if not created_at:
            return 365.0
        
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        return (now - created_at).days
    
    def _calculate_recency_weight(self, age_days: float) -> float:
        """Calculate weight based on recency (newer = higher weight)"""
        if age_days < 7:
            return 1.0
        elif age_days < 30:
            return 0.8
        elif age_days < 90:
            return 0.5
        else:
            return 0.2
    
    def should_be_verified(self, reputation_score: float) -> bool:
        """Check if user should be verified based on reputation"""
        return reputation_score >= self.min_for_verified
    
    def update_reputation_for_reaction(
        self,
        current_reputation: float,
        reaction_type: str,
        is_positive: bool
    ) -> float:
        """Update reputation when user receives a reaction"""
        if is_positive:
            if reaction_type == "helpful":
                return current_reputation + 1.0
            elif reaction_type == "like":
                return current_reputation + 0.2
            elif reaction_type in ["bullish", "bearish"]:
                return current_reputation + 0.1
        else:
            if reaction_type == "dislike":
                return max(0.0, current_reputation - 0.5)
        
        return current_reputation

