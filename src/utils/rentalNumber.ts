export function nextRentalNumber(date = new Date()) {
  const year = String(date.getFullYear()).slice(2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const suffix = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')
  return `RNT-${year}${month}${day}-${suffix}`
}
