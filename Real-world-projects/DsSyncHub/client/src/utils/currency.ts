export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
}

export const formatPrice = (amount: number, currency: string, suffix = ''): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' '
  return `${symbol}${amount.toLocaleString('en-IN')}${suffix}`
}
