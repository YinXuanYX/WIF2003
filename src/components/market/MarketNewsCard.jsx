import { useMarketNews } from '../../hooks/useMarketNews'

const formatDate = (unixTimestamp) => {
  if (!unixTimestamp) return ''
  return new Date(unixTimestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MarketNewsCard({ category = 'general', animationOrder = 0 }) {
  const { data, isLoading, isError, error } = useMarketNews(category)

  if (isLoading) {
    return (
      <div
        className="glass-card h-100 animate-fade-in-up"
        style={{ '--animation-order': animationOrder }}
      >
        <div className="card-body">
          <h6 className="stat-label mb-3">Market News</h6>
          <div className="placeholder-glow">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-3">
                <span className="placeholder col-8 mb-2" style={{ height: '0.9rem' }} />
                <span className="placeholder col-6 mb-2" style={{ height: '0.75rem' }} />
                <span className="placeholder col-10" style={{ height: '0.75rem' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data || !Array.isArray(data)) {
    const isRateLimited = error?.status === 429
    return (
      <div
        className="glass-card h-100 animate-fade-in-up"
        style={{ '--animation-order': animationOrder }}
      >
        <div className="card-body d-flex flex-column justify-content-center text-center py-5">
          <div className="fs-2 mb-2">📰</div>
          <h6 className="fw-semibold mb-2">
            {isRateLimited ? 'Rate limit reached' : 'News unavailable'}
          </h6>
          <p className="text-muted small mb-0">
            {isRateLimited
              ? 'Retrying in about 60 seconds.'
              : 'Please try again later.'}
          </p>
        </div>
      </div>
    )
  }

  const articles = data.slice(0, 5)

  return (
    <div
      className="glass-card h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <h6 className="stat-label mb-3">Market News</h6>
        <div className="d-flex flex-column gap-3">
          {articles.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none market-news-item"
            >
              <div
                className={`d-flex gap-3 ${idx < articles.length - 1 ? 'pb-3' : ''}`}
                style={idx < articles.length - 1 ? { borderBottom: '1px solid var(--bs-border-color, rgba(0,0,0,0.1))' } : {}}
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt=""
                    className="rounded"
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <div className="flex-grow-1 min-w-0">
                  <div
                    className="fw-semibold text-body small mb-1"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.headline}
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
                    <span>{article.source}</span>
                    <span>·</span>
                    <span>{formatDate(article.datetime)}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketNewsCard

const styles = `
.market-news-item {
  display: block;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease, transform 0.15s ease;
}
.market-news-item:hover {
  background-color: rgba(var(--bs-primary-rgb, 37, 99, 235), 0.06);
  transform: translateX(4px);
}
`

if (typeof document !== 'undefined' && !document.getElementById('market-news-card-styles')) {
  const sheet = document.createElement('style')
  sheet.id = 'market-news-card-styles'
  sheet.textContent = styles
  document.head.appendChild(sheet)
}
