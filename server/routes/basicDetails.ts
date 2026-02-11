import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso } from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'
import NDeliusIntegrationApiClient, { BasicDetails, DeliusAddress } from '../data/ndeliusIntegrationApiClient'
import { toFullUserDate } from '../utils/dateUtils'
import {
  findMainOrPostalAddressInAddressList,
  formatTitleAndFullName,
  handleIntegrationErrors,
  toCossoAddress,
} from '../utils/utils'
import { ErrorMessages } from '../data/uiModels'
import config from '../config'

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
    const callingScreen: string = req.query.returnTo as string
    let basicDetails: BasicDetails = null
    let cosso: Cosso = null

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

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    try {
      basicDetails = await ndeliusIntegrationApiClient.getBasicDetails(cosso.crn, res.locals.user.username)
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
        res.render(`pages/basic-details`, { errorMessages, showEmbeddedError })
        return
      }
      res.render(`pages/detailed-error`, { errorMessages })
      return
    }

    const formattedDob = toFullUserDate(basicDetails.dateOfBirth)
    const defaultAddress: DeliusAddress = findMainOrPostalAddressInAddressList(basicDetails.addresses)
    const titleAndFullName: string = formatTitleAndFullName(basicDetails.title, basicDetails.name)
    const addAddressDeeplink = `${config.ndeliusDeeplink.url}?component=AddressandAccommodation&CRN=${cosso.crn}`
    const { mobileNumber, telephoneNumber, emailAddress } = basicDetails

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/basic-details', {
      cosso,
      cossoId,
      currentPage,
      formattedDob,
      defaultAddress,
      titleAndFullName,
      mobileNumber,
      telephoneNumber,
      emailAddress,
      addAddressDeeplink,
      callingScreen,
    })
  })

  router.post('/basic-details/:id', async (req, res, next) => {
    const cossoClient = new CossoApiClient(authenticationClient)
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const callingScreen: string = req.query.returnTo as string
    let cosso: Cosso = null
    let basicDetails: BasicDetails = null

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

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    try {
      basicDetails = await ndeliusIntegrationApiClient.getBasicDetails(cosso.crn, res.locals.user.username)
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
        res.render(`pages/basic-details`, { errorMessages, showEmbeddedError })
        return
      }
      res.render(`pages/detailed-error`, { errorMessages })
      return
    }

    const defaultAddress: DeliusAddress = findMainOrPostalAddressInAddressList(basicDetails.addresses)
    cosso.postalAddress = toCossoAddress(defaultAddress)
    cosso.titleAndFullName = formatTitleAndFullName(basicDetails.title, basicDetails.name)

    const { mobileNumber, telephoneNumber, emailAddress } = basicDetails
    cosso.emailAddress = emailAddress
    cosso.mobileNumber = mobileNumber
    cosso.telephoneNumber = telephoneNumber
    cosso.dateOfBirth = `${basicDetails.dateOfBirth}T00:00:00`
    cosso.basicDetailsSaved = true

    await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)

    // if the user selected saveProgressAndClose then send a close back to the client
    if (req.body.action === 'saveProgressAndClose') {
      res.send(
        `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
      )
    } else if (req.body.action === 'refreshFromNdelius') {
      // redirect to warning details to force a reload
      res.redirect(`/basic-details/${cossoId}`)
    } else if (callingScreen && callingScreen === 'check-your-report') {
      res.redirect(`/check-your-report/${req.params.id}`)
    } else {
      res.redirect(`/witness-details/${cossoId}`)
    }
  })
  return router
}
