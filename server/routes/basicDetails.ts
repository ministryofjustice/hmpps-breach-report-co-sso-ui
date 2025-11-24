import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'

import CossoApiClient, { Cosso } from '../data/cossoApiClient'
import NDeliusIntegrationApiClient, { BasicDetails } from '../data/ndeliusIntegrationApiClient'
import CommonUtils from '../services/commonUtils'

export default function basicDetailsRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'basic-details'

  router.get('/basic-details/:id', async (req, res) => {
    await auditService.logPageView(Page.BASIC_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)

    const cossoId: string = req.params.id
    let cosso: Cosso = null
    const basicDetails: BasicDetails = null

    cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)

    res.render('pages/basic-details', {
      cosso,
      cossoId,
      basicDetails,
      currentPage,
    })
  })

  router.post('/basic-details/:id', async (req, res) => {
    const cossoClient = new CossoApiClient(authenticationClient)
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const callingScreen: string = req.query.returnTo as string

    const cossoId: string = req.params.id
    let cosso: Cosso = null
    const basicDetails: BasicDetails = null

    cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)

    if (req.body.action === 'saveProgressAndClose') {
      res.send(
        `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
      )
    } else {
      res.redirect(`/basic-details/${req.params.id}`)
    }
  })
  return router
}
