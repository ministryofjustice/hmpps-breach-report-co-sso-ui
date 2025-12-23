import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient from '../data/cossoApiClient'

export default function reportCompletedRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
): Router {
  router.get('/report-completed/:id', async (req, res) => {
    await auditService.logPageView(Page.REPORT_COMPLETED, { who: res.locals.user.username, correlationId: req.id })
    const cossoId: string = req.params.id
    const cossoApiClient = new CossoApiClient(authenticationClient)
    const cosso = await cossoApiClient.getCossoById(cossoId, res.locals.user.username)

    res.render('pages/report-completed', {
      cosso,
      cossoId,
    })
  })
  return router
}
