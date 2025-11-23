# Research Integration

This document describes how research findings from [AI in Investment Analysis: LLMs for Equity Stock Ratings](https://arxiv.org/html/2411.00856v1) have been integrated into the platform.

## Key Findings from Research

1. **Fundamentals Enhance Accuracy**: Incorporating financial fundamentals significantly improves stock rating predictions
2. **Sentiment Improves Short-Term**: News sentiment can enhance short-term performance, but may introduce bias
3. **Sentiment Scores vs. Full News**: Using sentiment scores instead of full news summaries reduces token usage without loss of performance
4. **Multi-Modal Data**: Combining fundamentals, market data, and sentiment works best

## Implemented Enhancements

### 1. Enhanced Fundamental Data Extraction

**Location**: `backend/app/services/market_data_service.py`

Added `_extract_fundamentals()` method that extracts:
- Revenue growth
- Earnings growth
- Profit margins
- Debt-to-equity ratio
- Return on equity
- P/E ratio
- Price-to-book ratio
- Enterprise value
- Free cash flow
- Revenue
- Earnings per share

These fundamentals are now included in market data and used in ranking algorithms.

### 2. StockTwits Sentiment Integration

**Location**: `backend/app/services/stocktwits_service.py`

Added service to fetch social sentiment from StockTwits:
- Aggregates bullish/bearish sentiment
- Provides sentiment scores (-1 to +1)
- Can use RapidAPI for full access or public API for limited access

**API Endpoints**:
- `GET /api/sentiment/stocktwits/{ticker}` - Get sentiment for a ticker
- `GET /api/sentiment/stocktwits/batch?tickers=AAPL,MSFT` - Batch sentiment

### 3. Enhanced LLM Prompts

**Location**: `backend/app/services/llm_service.py`

Updated prompts to emphasize:
- Forward-looking analysis (projections)
- Fundamental data usage
- Quality scoring based on fundamental analysis depth

The prompt now explicitly asks for:
- `forward_looking`: Whether analysis projects future performance
- `fundamental_focus`: Whether analysis emphasizes fundamentals

### 4. Improved Ranking Algorithm

**Location**: `backend/app/services/llm_service.py`

Enhanced `_calculate_market_relevance()` to include:
- Social sentiment boost (15% weight for strong sentiment)
- Fundamental data boost (10% weight when fundamentals are present)

This aligns with research showing:
- Sentiment improves short-term predictions
- Fundamentals enhance overall accuracy

### 5. Market Context Enhancement

**Location**: `backend/app/services/market_data_service.py`

`get_market_context()` now optionally includes:
- Social sentiment from StockTwits
- Fundamental data from yfinance
- Traditional market signals (volume, price movements)

## Configuration

### StockTwits API (Optional)

Add to `backend/.env`:
```bash
STOCKTWITS_API_KEY=your_rapidapi_key_here
```

Get API key from: https://rapidapi.com/stocktwits/api/stocktwits

If not configured, the service will attempt to use the public API (limited functionality).

## Usage Examples

### Get Sentiment for a Ticker

```python
from app.services.stocktwits_service import StockTwitsService

service = StockTwitsService()
sentiment = service.get_sentiment("AAPL")
print(f"Sentiment: {sentiment['sentiment_score']}")
print(f"Bullish: {sentiment['bullish_count']}")
print(f"Bearish: {sentiment['bearish_count']}")
```

### Enhanced Market Data

```python
from app.services.market_data_service import MarketDataService

service = MarketDataService()
data = service.get_ticker_data("AAPL")

# Now includes fundamentals
fundamentals = data.get("fundamentals", {})
print(f"Revenue Growth: {fundamentals.get('revenue_growth')}")
print(f"P/E Ratio: {fundamentals.get('price_to_earnings')}")
```

### Market Context with Sentiment

```python
market_context = service.get_market_context(
    tickers=["AAPL", "MSFT"],
    include_sentiment=True
)

for ticker, data in market_context["tickers"].items():
    print(f"{ticker}:")
    print(f"  Price Change: {data['price_change_24h']}%")
    print(f"  Social Sentiment: {data.get('social_sentiment', 0)}")
    print(f"  Revenue Growth: {data.get('fundamentals', {}).get('revenue_growth')}")
```

## Research References

- **Main Paper**: [AI in Investment Analysis: LLMs for Equity Stock Ratings](https://arxiv.org/html/2411.00856v1)
- **Key Finding**: Fundamentals enhance ratings accuracy
- **Key Finding**: Sentiment scores improve short-term performance without requiring full news summaries
- **Key Finding**: Multi-modal data (fundamentals + market + sentiment) provides best results

## Future Enhancements

Based on research, potential future improvements:

1. **News Sentiment Integration**: Add news sentiment scores (not full summaries) to reduce token usage
2. **Forward Returns Evaluation**: Track forward returns to validate rating accuracy
3. **Bias Reduction**: Implement mechanisms to reduce bias from sentiment data
4. **Longer Time Horizons**: Extend analysis to longer time horizons (currently focused on short-term)

## Notes

- StockTwits integration is optional - platform works without it
- Sentiment data enhances short-term predictions but may introduce bias
- Fundamentals are prioritized in quality scoring
- Research suggests omitting news data entirely can sometimes enhance performance by reducing bias

