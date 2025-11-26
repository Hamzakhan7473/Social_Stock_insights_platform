# Social Stock Insights Platform

A social-driven platform where users share stock analyses, trading ideas, and market insights. Powered by LLM-driven content organization, semantic tagging, and personalized feed ranking.

## 🚀 Features

- **Social Platform**: Post analyses, react to content, discover insights
- **LLM-Powered Analysis**: Automatic semantic tagging, summarization, quality scoring
- **Market Data Integration**: Live price movements, volume spikes, earnings releases
- **Fundamental Data**: Revenue growth, earnings, P/E ratios, and more (research-backed)
- **Social Sentiment**: StockTwits integration for social sentiment signals
- **Personalized Feeds**: AI-driven ranking based on user preferences and market signals
- **Dashboard**: Trending tickers, top insights, reputation scores, sentiment indicators
- **Transparency**: LLM-generated explanations for recommendations
- **Ensemble Ranking**: Multi-signal aggregation balancing quality, engagement, and market relevance
- **Research-Based**: Enhanced with findings from LLM stock rating research

## 📋 Project Requirements Met

✅ **LLM Pipeline**: Complete content analysis pipeline with semantic tagging, summarization, and quality scoring  
✅ **Insight Types**: Support for fundamental analysis, technical analysis, macro commentary, earnings forecasts, risk warnings  
✅ **Market Integration**: Live market data integration with dynamic re-ranking that highlights timely opportunities and deprioritizes outdated posts  
✅ **Ensemble Ranking**: Multi-signal aggregation system blending community sentiment, historical accuracy (reputation), and expert-tagged insights  
✅ **Dashboard UI**: Complete dashboard with trending tickers, insights, reputation, and sentiment  
✅ **Transparency**: LLM-generated natural language explanations for recommendations  
✅ **Reusable Service**: Exportable LLM service package for batch analytics and real-time feed generation  
✅ **Strategy Experimentation**: LLM-driven strategy experimentation balancing insight quality, diversity, and real-time responsiveness  
✅ **Batch Processing**: Batch analytics endpoint for downstream processing  
✅ **Dynamic Re-ranking**: Real-time re-ranking based on current market conditions  
✅ **Deployment**: Docker and Kubernetes deployment scripts  

## 🏗️ Architecture

- **Backend**: FastAPI service with PostgreSQL database
- **Frontend**: React/Next.js dashboard with Tailwind CSS
- **LLM Service**: Reusable Python package for content analysis and ranking
- **Market Data**: Integration with yfinance and extensible to other providers

## ⚡ Quick Start

See [QUICKSTART.md](QUICKSTART.md) for the fastest way to get started.

### Docker (Recommended)

```bash
cp backend/.env.example backend/.env
# Add your OPENAI_API_KEY to backend/.env
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

## 📚 Documentation

- [QUICKSTART.md](QUICKSTART.md) - Get started in 5 minutes
- [SETUP.md](SETUP.md) - Detailed setup and configuration guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design decisions
- [RESEARCH_INTEGRATION.md](RESEARCH_INTEGRATION.md) - Research-based enhancements and findings
- [llm_service/README.md](llm_service/README.md) - LLM service package documentation
- `frontend/LLM-Driven Stock Insight Platform Architecture.jam` - Visual architecture diagram

## 🔬 Research Integration

This platform incorporates findings from [AI in Investment Analysis: LLMs for Equity Stock Ratings](https://arxiv.org/html/2411.00856v1):

- **Fundamental Data**: Enhanced with financial fundamentals (revenue growth, P/E ratios, etc.)
- **Social Sentiment**: StockTwits integration for sentiment signals (improves short-term predictions)
- **Enhanced LLM Prompts**: Forward-looking analysis with fundamental focus
- **Multi-Modal Ranking**: Combines fundamentals, market data, and sentiment

See [RESEARCH_INTEGRATION.md](RESEARCH_INTEGRATION.md) for details.

## 🔧 Key Components

### Backend API (`backend/`)
- FastAPI REST API
- PostgreSQL database models
- LLM integration for content analysis
- Market data service
- Reputation scoring system
- Feed ranking engine

### Frontend Dashboard (`frontend/`)
- Next.js/React application
- Dashboard with analytics
- Personalized feed
- Post creation and interaction
- Sentiment visualization

### LLM Service Package (`llm_service/`)
- Reusable Python package
- Content analyzer
- Ranking engine
- Trend detector
- Exportable for batch processing

## 🎯 API Endpoints

### Core Endpoints
- `POST /api/posts/` - Create a post (triggers LLM analysis)
- `GET /api/feeds/personalized` - Get personalized ranked feed
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/market/ticker/{ticker}` - Live market data
- `GET /api/analytics/explanation/{post_id}` - LLM-generated explanation

### Advanced Endpoints
- `POST /api/analytics/batch` - Batch analytics for downstream processing
- `POST /api/analytics/rerank` - Dynamically re-rank posts with fresh market data
- `GET /api/analytics/strategy-experiment` - Experiment with different ranking strategies

### Ranking Strategies
The platform supports multiple ranking strategies:
- **balanced** (default): Equal weight to all signals
- **quality_focused**: Prioritize high-quality analysis
- **trending**: Prioritize market relevance and timeliness
- **diverse**: Maximize diversity across tickers/sectors
- **expert**: Prioritize high-reputation authors

See http://localhost:8000/docs for full API documentation.

## 🔑 Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key

Optional:
- `STOCKTWITS_API_KEY` - RapidAPI key for StockTwits sentiment (get from https://rapidapi.com/stocktwits/api/stocktwits)

See `backend/.env.example` for all configuration options.

## 🐳 Deployment

- **Docker Compose**: `docker-compose up -d`
- **Kubernetes**: See `deployment/kubernetes/`
- **Manual**: See [SETUP.md](SETUP.md)

## 🧪 Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test

# LLM Service
cd llm_service && python example_usage.py
```

## 📦 Project Structure

```
Social Stock Insights platform/
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
├── llm_service/       # Reusable LLM package
├── deployment/        # Deployment scripts
├── docker-compose.yml  # Docker setup
└── README.md          # This file
```

## 🚧 Future Enhancements

- Real-time updates (WebSockets)
- User authentication (JWT)
- Following/followers system
- Historical accuracy tracking
- Advanced analytics and backtesting
- Multi-provider market data aggregation

## 📄 License

This project is provided as-is for demonstration purposes.

