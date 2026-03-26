import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso } from '../data/cossoApiClient'
import { ErrorMessages } from '../data/uiModels'
import { handleIntegrationErrors } from '../utils/utils'
import CommonUtils from '../services/commonUtils'

export default function deleteRecipientRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  router.get('/delete-amendment/:cossoId/:amendmentId', async (req, res) => {
    await auditService.logPageView(Page.DELETE_AMENDMENT, { who: res.locals.user.username, correlationId: req.id })
    const { cossoId, amendmentId } = req.params
    const cossoApiClient = new CossoApiClient(authenticationClient)
    const cosso: Cosso = await cossoApiClient.getCossoById(cossoId, res.locals.user.username)
    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return
    res.render('pages/delete-amendment', { cossoId, amendmentId })
  })

  router.post('/delete-amendment/:cossoId/:amendmentId', async (req, res) => {
    await auditService.logPageView(Page.DELETE_AMENDMENT, { who: res.locals.user.username, correlationId: req.id })
    const { cossoId, amendmentId } = req.params
    const callingScreen: string = req.query.returnTo as string
    const cossoApiClient = new CossoApiClient(authenticationClient)

    if (req.body.action === 'confirm') {
      try {
        const cosso: Cosso = await cossoApiClient.getCossoById(cossoId, res.locals.user.username)
        if (Object.keys(cosso).length === 0) {
          const errorMessages: ErrorMessages = {}
          errorMessages.genericErrorMessage = {
            text: 'The document has not been found or has been deleted. An error has been logged. 404',
          }
          res.render(`pages/detailed-error`, { errorMessages })
          return
        }
        await cossoApiClient.deleteAmendment(amendmentId, res.locals.user.username)
      } catch (error) {
        const errorMessages: ErrorMessages = handleIntegrationErrors(error.status, error.data?.message, 'COSSO')
        const showEmbeddedError = true
        res.render(`pages/detailed-error`, { errorMessages, showEmbeddedError })
        return
      }
    }
    let redirectUrl = `/offence-details/${cossoId}`
    if (callingScreen) redirectUrl += `?returnTo=${callingScreen}`
    res.redirect(redirectUrl)
  })

  return router
}
