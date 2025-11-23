'use client'

interface TrendingTickersProps {
  tickers: any[]
}

export default function TrendingTickers({ tickers }: TrendingTickersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Trending Tickers</h2>
      <div className="space-y-3">
        {tickers.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No trending tickers</div>
        ) : (
          tickers.map((ticker, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                <div>
                  <div className="font-semibold text-lg text-gray-900">
                    ${ticker.ticker}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticker.post_count} posts
                  </div>
                </div>
              </div>
              <div className="text-right">
                {ticker.price_change_24h !== null && (
                  <div
                    className={`font-semibold ${
                      ticker.price_change_24h >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {ticker.price_change_24h >= 0 ? '+' : ''}
                    {ticker.price_change_24h.toFixed(2)}%
                  </div>
                )}
                {ticker.sentiment_score !== null && (
                  <div className="text-sm text-gray-500">
                    Sentiment:{' '}
                    {ticker.sentiment_score > 0 ? '📈' : '📉'}{' '}
                    {Math.abs(ticker.sentiment_score * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

