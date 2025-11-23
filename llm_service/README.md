# LLM Service Package

Reusable Python package for content analysis, ranking, and trend detection in the Social Stock Insights platform.

## Installation

```bash
pip install -e .
```

Or install dependencies directly:
```bash
pip install -r requirements.txt
```

## Usage

### Content Analysis

```python
from llm_service import LLMAnalyzer

analyzer = LLMAnalyzer(
    api_key="your-openai-api-key",
    model="gpt-4-turbo-preview"
)

result = analyzer.analyze(
    title="Apple Q4 Earnings Analysis",
    content="Apple reported strong earnings...",
    ticker="AAPL"
)

print(result["summary"])
print(result["quality_score"])
print(result["semantic_tags"])
```

### Ranking Engine

```python
from llm_service import RankingEngine

engine = RankingEngine()

ranked_posts = engine.rank(
    posts=[...],  # List of post dictionaries
    user_preferences={
        "preferred_sectors": ["Technology"],
        "preferred_insight_types": ["fundamental_analysis"],
        "followed_tickers": ["AAPL", "MSFT"]
    },
    market_context={
        "tickers": {
            "AAPL": {
                "volume_spike": True,
                "price_change_24h": 5.2
            }
        }
    }
)
```

### Trend Detection

```python
from llm_service import TrendDetector

detector = TrendDetector()

trends = detector.detect_community_trends(posts)
sector_trends = detector.detect_sector_trends(posts)
```

## Batch Processing

The analyzer supports batch processing for efficient analysis of multiple posts:

```python
posts = [
    {"title": "...", "content": "...", "ticker": "AAPL"},
    {"title": "...", "content": "...", "ticker": "MSFT"}
]

results = analyzer.batch_analyze(posts)
```

## Integration

This package can be used independently or integrated into the FastAPI backend. The semantic tagging and ranking logic is preserved, enabling downstream batch analytics or real-time feed generation.

