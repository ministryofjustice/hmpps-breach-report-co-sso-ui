import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso } from '../data/cossoApiClient'
import NDeliusIntegrationApiClient, { SignAndSendDetails } from '../data/ndeliusIntegrationApiClient'
import { ErrorMessages } from '../data/uiModels'
import { handleIntegrationErrors } from '../utils/utils'
import { toFullUserDate } from '../utils/dateUtils'

export default function signAndSendRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
): Router {
  const currentPage = 'sign-and-send'

  router.get('/sign-and-send/:id', async (req, res) => {
    await auditService.logPageView(Page.SIGN_AND_SEND, { who: res.locals.user.username, correlationId: req.id })

    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const callingScreen: string = req.query.returnTo as string

    let cosso: Cosso = null
    let errorMessages: ErrorMessages = {}
    let signAndSendDetails: SignAndSendDetails

    try {
      cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)
      if (Object.keys(cosso).length === 0) {
        errorMessages.genericErrorMessage = {
          text: 'The document has not been found or has been deleted. An error has been logged. 404',
        }
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }
    } catch (error) {
      errorMessages = handleIntegrationErrors(error?.responseStatus, error?.data?.userMessage, 'Breach Report CO SSO')

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
      res.render(`pages/sign-and-send`, { errorMessages, showEmbeddedError })
      return
    }

    try {
      signAndSendDetails = await ndeliusIntegrationApiClient.getSignAndSendDetails(cosso.crn, res.locals.user.username)
    } catch (error) {
      errorMessages = {
        ...errorMessages,
        ...handleIntegrationErrors(error?.responseStatus, error.data?.userMessage, 'NDelius Integration'),
      }

      // take the user to detailed error page for 400 type errors
      if (error.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      // stay on the current page for 500 errors
      if (error.responseStatus === 500) {
        const showEmbeddedError = true
        res.render(`pages/basic-details`, { errorMessages, showEmbeddedError })
        return
      }
      res.render(`pages/detailed-error`, { errorMessages })
      return
    }

    res.render('pages/sign-and-send', {
      cosso,
      cossoId,
      currentPage,
      callingScreen,
      signAndSendDetails,
    })
  })

  router.post('/sign-and-send/:id', async (req, res) => {
    await auditService.logPageView(Page.SIGN_AND_SEND, { who: res.locals.user.username, correlationId: req.id })

    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoClient = new CossoApiClient(authenticationClient)

    const cossoId: string = req.params.id
    const callingScreen: string = req.query.returnTo as string

    const formSentBy: string = req.body.whoIsSendingTheForm || null

    let cosso: Cosso = null
    let signAndSendDetails: SignAndSendDetails
    let errorMessages: ErrorMessages = {}

    try {
      cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)
      if (Object.keys(cosso).length === 0) {
        errorMessages.genericErrorMessage = {
          text: 'The document has not been found or has been deleted. An error has been logged. 404',
        }
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }
    } catch (error) {
      errorMessages = {
        ...errorMessages,
        ...handleIntegrationErrors(error?.responseStatus, error?.data?.userMessage, 'Breach Report CO SSO'),
      }

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
      res.render(`pages/sign-and-send`, { errorMessages, showEmbeddedError })
      return
    }

    try {
      signAndSendDetails = await ndeliusIntegrationApiClient.getSignAndSendDetails(cosso.crn, res.locals.user.username)
    } catch (error) {
      errorMessages = {
        ...errorMessages,
        ...handleIntegrationErrors(error?.responseStatus, error.data?.userMessage, 'NDelius Integration'),
      }

      if (error.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      if (error.responseStatus === 500) {
        const showEmbeddedError = true
        res.render(`pages/basic-details`, { errorMessages, showEmbeddedError })
        return
      }

      res.render(`pages/detailed-error`, { errorMessages })
      return
    }

    if (req.body.action === 'saveProgressAndClose') {
      cosso.signAndSendSaved = true
      cosso.signedByRo = null
      if (formSentBy !== null) {
        cosso.signedByRo = formSentBy === 'RO'
        await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)
        res.send(
          `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
        )
      } else {
        errorMessages.sentByResponsibleOfficerOrUser = {
          text: 'Please select who is sending this document before leaving this screen',
        }
        res.render('pages/sign-and-send', {
          errorMessages,
          cosso,
          cossoId,
          currentPage,
          callingScreen,
          signAndSendDetails,
        })
      }
    } else if (req.body.action === 'clear-signature') {
      cosso.signature = null
      cosso.sheetSentBy = null
      await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)
      res.redirect(`/sign-and-send/${req.params.id}`)
    } else if (req.body.action === 'sign') {
      cosso.signature = createSignatureString(signAndSendDetails)
      cosso.sheetSentBy = getOfficerString(signAndSendDetails)
      await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)
      res.redirect(`/sign-and-send/${req.params.id}`)
    } else if (callingScreen === 'check-your-report') {
      cosso.signAndSendSaved = true
      cosso.signedByRo = null
      if (formSentBy !== null) {
        cosso.signedByRo = formSentBy === 'RO'
        await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)
        res.redirect(`/check-your-report/${cossoId}`)
      } else {
        errorMessages.sentByResponsibleOfficerOrUser = {
          text: 'Please select who is sending this document before leaving this screen',
        }
        res.render('pages/sign-and-send', {
          errorMessages,
          cosso,
          cossoId,
          currentPage,
          callingScreen,
          signAndSendDetails,
        })
      }
    } else if (req.body.action === 'refreshFromNdelius') {
      res.redirect(`/sign-and-send/${cossoId}`)
    } else {
      cosso.signAndSendSaved = true
      cosso.signedByRo = null
      if (formSentBy !== null) {
        cosso.signedByRo = formSentBy === 'RO'
        await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)
        res.redirect(`/check-your-report/${cossoId}`)
      } else {
        errorMessages.sentByResponsibleOfficerOrUser = {
          text: 'Please select who is sending this document before leaving this screen',
        }
        res.render('pages/sign-and-send', {
          errorMessages,
          cosso,
          cossoId,
          currentPage,
          callingScreen,
          signAndSendDetails,
        })
      }
    }
  })

  function createSignatureString(signAndSendDetails: SignAndSendDetails): string {
    let signature: string = ''
    if (signAndSendDetails != null && signAndSendDetails.name != null) {
      signature += signAndSendDetails.name.forename
      if (signAndSendDetails.name.middleName != null) {
        signature += ` ${signAndSendDetails.name.middleName}`
      }
      signature += ` ${signAndSendDetails.name.surname} ${toFullUserDate(new Date().toISOString())}`
    }
    return signature
  }

  function getOfficerString(signAndSendDetails: SignAndSendDetails): string {
    let signature: string = ''
    if (signAndSendDetails != null && signAndSendDetails.name != null) {
      signature += signAndSendDetails.name.forename
      if (signAndSendDetails.name.middleName != null) {
        signature += ` ${signAndSendDetails.name.middleName}`
      }
      signature += ` ${signAndSendDetails.name.surname}`
    }
    return signature
  }

  return router
}
