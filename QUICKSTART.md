# Quick Start Guide

Get the Social Stock Insights platform running in 5 minutes!

## Option 1: Docker (Recommended)

```bash
# 1. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your OPENAI_API_KEY

# 2. Start everything
docker-compose up -d

# 3. Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Option 2: Manual Setup

### Backend (Terminal 1)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up .env file
cp .env.example .env
# Add OPENAI_API_KEY to .env

# Start server
uvicorn app.main:app --reload
```

### Frontend (Terminal 2)

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

## First Steps

1. **Create a user** (via API or add directly to database)
2. **Create a post** via API:
   ```bash
   curl -X POST http://localhost:8000/api/posts/ \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Apple Q4 Analysis",
       "content": "Apple reported strong earnings...",
       "ticker": "AAPL",
       "insight_type": "fundamental_analysis"
     }'
   ```
3. **View dashboard** at http://localhost:3000
4. **Check personalized feed** - posts are automatically analyzed and ranked

## Testing the LLM Service

```bash
cd llm_service
pip install -e .
python example_usage.py
```

## Troubleshooting

- **Database connection error**: Make sure PostgreSQL is running
- **OpenAI API error**: Check your API key in `.env`
- **Frontend can't connect**: Verify `NEXT_PUBLIC_API_URL` matches backend URL
- **Port already in use**: Change ports in docker-compose.yml or stop conflicting services

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed configuration
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- Explore the API docs at http://localhost:8000/docs

