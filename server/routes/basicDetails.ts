import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'

import CossoApiClient, { Cosso } from '../data/cossoApiClient'

export default function basicDetailsRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
): Router {
  const currentPage = 'basic-details'

  router.get('/basic-details/:id', async (req, res) => {
    await auditService.logPageView(Page.BASIC_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const cosso: Cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)

    res.render('pages/basic-details', {
      cosso,
      cossoId,
      currentPage,
    })
  })
  return router
}
