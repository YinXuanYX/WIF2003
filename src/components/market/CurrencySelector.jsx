import SegmentedControl from '../ui/SegmentedControl'
import { CURRENCY_LIST } from '../../utils/currencies'

function CurrencySelector({ value = 'usd', onChange }) {
  return (
    <div style={{ maxWidth: 420 }}>
      <SegmentedControl
        options={CURRENCY_LIST}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default CurrencySelector
