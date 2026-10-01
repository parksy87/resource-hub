const namedTypes = new Set(['NOTEBOOK', 'TABLET', 'CAMERA', 'PROJECTOR', 'MEETING_ROOM', 'PASSENGER_VEHICLE'])

export function matchesResourceGroup(type: string, group: string) {
  if (!group) return true
  if (group === 'VEHICLE') return type === 'PASSENGER_VEHICLE'
  if (group === 'ETC') return !namedTypes.has(type)
  return type === group
}
