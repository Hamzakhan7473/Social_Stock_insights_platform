"""
Example usage of the LLM Service package
"""
from llm_service import LLMAnalyzer, RankingEngine, TrendDetector
import os

# Initialize analyzer
analyzer = LLMAnalyzer(
    api_key=os.getenv("OPENAI_API_KEY", ""),
    model="gpt-4-turbo-preview"
)

# Example post
post_data = {
    "title": "Apple Q4 Earnings Beat Expectations",
    "content": """
    Apple reported Q4 earnings that exceeded analyst expectations. 
    Revenue grew 8% year-over-year, driven by strong iPhone sales 
    and services growth. The company's guidance for next quarter 
    is optimistic, suggesting continued momentum in the premium 
    smartphone market.
    """,
    "ticker": "AAPL"
}

# Analyze post
print("Analyzing post...")
result = analyzer.analyze(
    title=post_data["title"],
    content=post_data["content"],
    ticker=post_data["ticker"]
)

print(f"\nSummary: {result['summary']}")
print(f"Quality Score: {result['quality_score']}")
print(f"Semantic Tags: {result['semantic_tags']}")
print(f"Sector: {result['sector']}")
print(f"Insight Type: {result['insight_type']}")

# Example ranking
print("\n\nRanking posts...")
ranking_engine = RankingEngine()

sample_posts = [
    {
        **post_data,
        **result,
        "like_count": 10,
        "helpful_count": 5,
        "author_reputation_score": 75.0
    }
]

ranked = ranking_engine.rank(
    posts=sample_posts,
    user_preferences={
        "preferred_sectors": ["Technology"],
        "preferred_insight_types": ["fundamental_analysis"],
        "followed_tickers": ["AAPL"]
    }
)

print(f"Ranking Score: {ranked[0]['ranking_score']}")

# Example trend detection
print("\n\nDetecting trends...")
trend_detector = TrendDetector()

trends = trend_detector.detect_community_trends(sample_posts)
print(f"Detected {len(trends)} trends")

