import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso } from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'

export default function offenceDetailsRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'offence-details'

  router.get('/offence-details/:id', async (req, res) => {
    await auditService.logPageView(Page.OFFENCE_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const cosso: Cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/offence-details', {
      cosso,
      cossoId,
      currentPage,
    })
  })
  return router
}
