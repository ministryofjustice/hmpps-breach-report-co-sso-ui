import { CossoAmendment } from '../data/cossoApiClient'
import { sortAmendmentsByDateDesc } from './offence-details'

describe('sortAmendmentsByDateDesc', () => {
  it('should sort amendments by amendment date with newest first', () => {
    const amendments: CossoAmendment[] = [
      {
        id: 'oldest',
        cossoId: 'cosso-id',
        amendmentDetails: 'Oldest',
        amendmentReason: 'Oldest reason',
        amendmentDate: '2025-12-25',
      },
      {
        id: 'newest',
        cossoId: 'cosso-id',
        amendmentDetails: 'Newest',
        amendmentReason: 'Newest reason',
        amendmentDate: '2026-01-14',
      },
      {
        id: 'middle',
        cossoId: 'cosso-id',
        amendmentDetails: 'Middle',
        amendmentReason: 'Middle reason',
        amendmentDate: '2025-12-31T00:00:00',
      },
    ]

    expect(sortAmendmentsByDateDesc(amendments).map(amendment => amendment.id)).toEqual(['newest', 'middle', 'oldest'])
  })
})
