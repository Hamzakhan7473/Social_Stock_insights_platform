"""
LLM Analyzer for content analysis and semantic tagging
"""
import json
from typing import Dict, Any, Optional, List
from openai import OpenAI


class LLMAnalyzer:
    """
    Analyzes posts and extracts semantic tags, summaries, and quality scores.
    Designed for fixed latency/compute budget.
    """
    
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4-turbo-preview",
        max_tokens: int = 1000,
        temperature: float = 0.3
    ):
        self.client = OpenAI(api_key=api_key)
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
    
    def analyze(
        self,
        title: str,
        content: str,
        ticker: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze a post and return structured insights.
        
        Returns:
            Dict with keys: summary, quality_score, semantic_tags, sector,
            catalyst_type, risk_profile, insight_type, key_points
        """
        prompt = self._build_prompt(title, content, ticker)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert financial analyst assistant."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return self._normalize_result(result)
        except Exception as e:
            return self._fallback_analysis(title, content, ticker)
    
    def _build_prompt(self, title: str, content: str, ticker: Optional[str]) -> str:
        """Build analysis prompt"""
        return f"""Analyze this stock analysis post:

Title: {title}
Content: {content}
Ticker: {ticker or "Not specified"}

Return JSON:
{{
    "summary": "2-3 sentence summary",
    "quality_score": 0.0-100.0,
    "semantic_tags": ["sector:tech", "catalyst:earnings", ...],
    "sector": "Technology/Healthcare/etc or null",
    "catalyst_type": "earnings/merger/news/etc or null",
    "risk_profile": "low/moderate/high",
    "insight_type": "fundamental_analysis/technical_analysis/macro_commentary/earnings_forecast/risk_warning",
    "key_points": ["point1", "point2"]
}}"""
    
    def _normalize_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize LLM result to ensure consistent format"""
        return {
            "summary": result.get("summary", ""),
            "quality_score": float(result.get("quality_score", 0.0)),
            "semantic_tags": result.get("semantic_tags", []),
            "sector": result.get("sector"),
            "catalyst_type": result.get("catalyst_type"),
            "risk_profile": result.get("risk_profile", "moderate"),
            "insight_type": result.get("insight_type", "macro_commentary"),
            "key_points": result.get("key_points", [])
        }
    
    def _fallback_analysis(
        self,
        title: str,
        content: str,
        ticker: Optional[str]
    ) -> Dict[str, Any]:
        """Fallback when LLM fails"""
        return {
            "summary": f"{title}: {content[:200]}...",
            "quality_score": 50.0,
            "semantic_tags": [],
            "sector": None,
            "catalyst_type": None,
            "risk_profile": "moderate",
            "insight_type": "macro_commentary",
            "key_points": []
        }
    
    def batch_analyze(self, posts: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Analyze multiple posts (for batch processing)"""
        results = []
        for post in posts:
            result = self.analyze(
                post.get("title", ""),
                post.get("content", ""),
                post.get("ticker")
            )
            results.append({**post, **result})
        return results

