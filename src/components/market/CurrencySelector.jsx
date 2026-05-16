import SegmentedControl from '../ui/SegmentedControl'

const CURRENCIES = [
  { label: 'USD', value: 'usd' },
  { label: 'EUR', value: 'eur' },
  { label: 'GBP', value: 'gbp' },
  { label: 'JPY', value: 'jpy' },
  { label: 'MYR', value: 'myr' },
]

function CurrencySelector({ value = 'usd', onChange }) {
  return (
    <div style={{ maxWidth: 320 }}>
      <SegmentedControl
        options={CURRENCIES}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default CurrencySelector
