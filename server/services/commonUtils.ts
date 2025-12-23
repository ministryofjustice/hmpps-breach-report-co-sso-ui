import { type Response } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Cosso } from '../data/cossoApiClient'
import NDeliusIntegrationApiClient, { LimitedAccessCheck } from '../data/ndeliusIntegrationApiClient'

export default class CommonUtils {
  constructor() {}

  async redirectRequired(
    cosso: Cosso,
    cossoId: string,
    res: Response,
    authenticationClient: AuthenticationClient,
  ): Promise<boolean> {
    if (cosso.completedDate != null) {
      res.redirect(`/report-completed/${cossoId}`)
      return true
    }

    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)

    const laoCheck: LimitedAccessCheck = await ndeliusIntegrationApiClient.getLimitedAccessCheck(
      cosso.crn,
      res.locals.user.username,
    )
    if (laoCheck.userExcluded || laoCheck.userRestricted) {
      res.render('pages/limited-access', {
        laoCheck,
      })
      return true
    }

    return false
  }
}
