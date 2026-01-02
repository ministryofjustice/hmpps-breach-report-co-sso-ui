import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso } from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'

export default function checkYourReportRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'check-your-report'

  router.get('/check-your-report/:id', async (req, res) => {
    await auditService.logPageView(Page.CHECK_YOUR_REPORT, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const cosso: Cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/check-your-report', {
      cosso,
      cossoId,
      currentPage,
    })
  })
  return router
}
