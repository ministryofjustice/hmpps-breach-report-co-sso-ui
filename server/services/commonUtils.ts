import { type Response } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Cosso } from '../data/cossoApiClient'
import ProbationAccessControlApiClient, { LimitedAccessCheck } from '../data/probationAccessControlApiClient'

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

    const probationAccessControlApiClient = new ProbationAccessControlApiClient(authenticationClient)

    const laoCheck: LimitedAccessCheck = await probationAccessControlApiClient.getLimitedAccessCheck(
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
