import { toIsoLocalDateTime } from './dateUtils'

describe('toIsoLocalDateTime', () => {
  it('removes an offset and keeps the local date and time', () => {
    expect(toIsoLocalDateTime('2026-06-19T14:25:00+01:00')).toBe('2026-06-19T14:25:00')
  })

  it('removes a UTC designator and keeps the local date and time', () => {
    expect(toIsoLocalDateTime('2026-06-19T14:25:00Z')).toBe('2026-06-19T14:25:00')
  })

  it('leaves an ISO local datetime unchanged', () => {
    expect(toIsoLocalDateTime('2026-06-19T14:25:00')).toBe('2026-06-19T14:25:00')
  })

  it('returns an empty string when the value is empty', () => {
    expect(toIsoLocalDateTime('')).toBe('')
  })
})
