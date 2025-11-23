# Changelog

## [1.1.0] - Research Integration Update

### Added
- **StockTwits Sentiment Integration**: Added social sentiment service for StockTwits data
  - API endpoint: `GET /api/sentiment/stocktwits/{ticker}`
  - Batch endpoint: `GET /api/sentiment/stocktwits/batch?tickers=AAPL,MSFT`
  - Optional RapidAPI integration for full access
  - Research shows sentiment improves short-term predictions

- **Enhanced Fundamental Data**: Market data service now extracts comprehensive fundamentals
  - Revenue growth, earnings growth, profit margins
  - Debt-to-equity, return on equity
  - P/E ratio, price-to-book ratio
  - Enterprise value, free cash flow
  - Research shows fundamentals enhance ratings accuracy

- **Improved LLM Prompts**: Enhanced analysis prompts based on research
  - Emphasis on forward-looking analysis
  - Fundamental data focus
  - Quality scoring based on analytical depth

- **Enhanced Ranking Algorithm**: Market relevance calculation now includes
  - Social sentiment boost (15% weight)
  - Fundamental data boost (10% weight)
  - Better balance of signals

### Research References
- Integrated findings from: [AI in Investment Analysis: LLMs for Equity Stock Ratings](https://arxiv.org/html/2411.00856v1)
- Key insights:
  - Fundamentals enhance ratings accuracy
  - Sentiment scores improve short-term performance
  - Multi-modal data (fundamentals + market + sentiment) works best

### Configuration
- Added `STOCKTWITS_API_KEY` environment variable (optional)
- Get API key from: https://rapidapi.com/stocktwits/api/stocktwits

## [1.0.0] - Initial Release

### Features
- Social platform for stock analysis posts
- LLM-powered content analysis and tagging
- Market data integration (yfinance)
- Personalized feed ranking
- Dashboard with analytics
- User reputation system
- Transparency tooling (LLM explanations)
- Docker deployment
- Kubernetes manifests

