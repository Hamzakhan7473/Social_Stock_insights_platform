"""
Setup script for LLM Service package
"""
from setuptools import setup, find_packages

setup(
    name="social-stock-llm-service",
    version="1.0.0",
    description="LLM service for social stock insights platform",
    author="Social Stock Insights",
    packages=find_packages(),
    install_requires=[
        "openai>=1.3.0",
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "pydantic>=2.0.0",
    ],
    python_requires=">=3.9",
)

