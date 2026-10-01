export const resourceUsageCounts: Record<number, number> = {
  248: 128,
  247: 54,
  246: 19,
  245: 77,
  244: 41,
  243: 63,
  242: 96,
  241: 58,
  240: 71,
  239: 33,
  238: 88,
  237: 47,
  236: 22,
  235: 15,
  234: 9,
  233: 84,
}

export function resourceUsageCount(id: number | string) {
  if (typeof id === 'string') return 0
  return resourceUsageCounts[id] ?? 0
}
