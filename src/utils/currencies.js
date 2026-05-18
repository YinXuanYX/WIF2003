const CURRENCY_CONFIG = {
  usd: { code: 'USD', symbol: '$', prefix: '$', flag: '\ud83c\uddfa\ud83c\uddf8' },
  eur: { code: 'EUR', symbol: '\u20ac', prefix: '\u20ac', flag: '\ud83c\uddea\ud83c\uddfa' },
  gbp: { code: 'GBP', symbol: '\u00a3', prefix: '\u00a3', flag: '\ud83c\uddec\ud83c\udde7' },
  jpy: { code: 'JPY', symbol: '\u00a5', prefix: '\u00a5', flag: '\ud83c\uddef\ud83c\uddf5' },
  myr: { code: 'MYR', symbol: 'RM', prefix: 'RM ', flag: '\ud83c\uddf2\ud83c\uddfe' },
  sgd: { code: 'SGD', symbol: 'S$', prefix: 'S$', flag: '\ud83c\uddf8\ud83c\uddec' },
}

export const CURRENCY_SYMBOLS = Object.fromEntries(
  Object.entries(CURRENCY_CONFIG).map(([key, cfg]) => [key, cfg.symbol])
)

export const CURRENCY_LABELS = Object.fromEntries(
  Object.entries(CURRENCY_CONFIG).map(([key, cfg]) => [key, cfg.code])
)

export const CURRENCY_LIST = Object.entries(CURRENCY_CONFIG).map(([key, cfg]) => ({
  value: key,
  label: cfg.code,
}))

export const CURRENCY_OPTIONS = Object.entries(CURRENCY_CONFIG).map(([key, cfg]) => ({
  value: key,
  label: `${cfg.flag} ${cfg.code}`,
}))

export default CURRENCY_CONFIG
