import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso } from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'
import NDeliusIntegrationApiClient, { OffenceDetails } from '../data/ndeliusIntegrationApiClient'
import { ErrorMessages } from '../data/uiModels'
import { handleIntegrationErrors } from '../utils/utils'

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
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoId: string = req.params.id
    let cosso: Cosso
    let offenceDetails: OffenceDetails

    try {
      cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)
      if (Object.keys(cosso).length === 0) {
        const errorMessages: ErrorMessages = {}
        errorMessages.genericErrorMessage = {
          text: 'The document has not been found or has been deleted. An error has been logged. 404',
        }
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }
    } catch (error) {
      const errorMessages: ErrorMessages = handleIntegrationErrors(
        error?.responseStatus,
        error?.data?.userMessage,
        'Breach Report CO SSO',
      )

      // Navigate to the detailed error page on 400
      if (error?.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      // Navigate to the detailed error page on 404
      if (error?.responseStatus === 404) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      const showEmbeddedError = true
      res.render(`pages/basic-details`, { errorMessages, showEmbeddedError })
      return
    }

    try {
      offenceDetails = await ndeliusIntegrationApiClient.getOffenceDetails(cosso.crn, res.locals.user.username)
    } catch (error) {
      const errorMessages: ErrorMessages = handleIntegrationErrors(
        error.responseStatus,
        error.data?.message,
        'NDelius Integration',
      )

      // take the user to detailed error page for 400 type errors
      if (error.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      // stay on the current page for 500 errors
      if (error.responseStatus === 500) {
        const showEmbeddedError = true
        res.render(`pages/offence-details`, { errorMessages, showEmbeddedError })
        return
      }
      res.render(`pages/detailed-error`, { errorMessages })
      return
    }

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/offence-details', {
      cosso,
      cossoId,
      currentPage,
      offenceDetails,
    })
  })

  router.post('/offence-details/:id', async (req, res, next) => {
    await auditService.logPageView(Page.OFFENCE_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoId: string = req.params.id

    // if the user selected saveProgressAndClose then send a close back to the client
    if (req.body.action === 'saveProgressAndClose') {
      res.send(
        `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
      )
    } else if (req.body.action === 'addAmendment') {
      res.redirect(`/add-amendment/${cossoId}`)
    } else {
      res.redirect(`/failures/${cossoId}`)
    }
  })

  return router
}
