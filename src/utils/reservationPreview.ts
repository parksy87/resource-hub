let previewSequence = 1

export function nextPreviewReservationNumber(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const sequence = String(previewSequence).padStart(4, '0')
  previewSequence += 1
  return `R-${year}${month}${day}-${sequence}`
}

export function nextReservationNumber(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const suffix = String(Math.floor(Math.random() * 9000) + 1000)
  return `R-${year}${month}${day}-${suffix}`
}
