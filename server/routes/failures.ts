import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso, CossoContact, ScreenInformation } from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'
import { ErrorMessages } from '../data/uiModels'
import asArray, { handleIntegrationErrors } from '../utils/utils'
import NDeliusIntegrationApiClient, { EnforceableContact, Failures } from '../data/ndeliusIntegrationApiClient'

export default function failuresRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'failures'

  router.get('/failures/:id', async (req, res) => {
    await auditService.logPageView(Page.FAILURES, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const callingScreen: string = req.query.returnTo as string
    let cosso: Cosso = null
    let failures: Failures = null
    let screenInfo: ScreenInformation[] = null

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
      screenInfo = await cossoClient.getScreenInformationForScreen(
        'failures_and_enforcements',
        res.locals.user.username,
      )
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
      failures = await ndeliusIntegrationApiClient.getFailures(cosso.crn, res.locals.user.username)
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
    const existingContacts = cosso.cossoContactList.map(c => c.deliusContactId)
    const enforceableContactListIds = failures.enforceableContacts?.map(c => c.id)
    for (const contact of cosso.cossoContactList) {
      if (!enforceableContactListIds || !enforceableContactListIds.includes(contact.deliusContactId)) {
        failures.enforceableContacts.push({
          id: contact.deliusContactId,
          datetime: null,
          description: null,
          type: { description: contact.contactTypeDescription, code: '-1' },
          outcome: null,
          notes: null,
        })
      }
    }

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/failures', {
      cosso,
      cossoId,
      currentPage,
      failures,
      existingContacts,
      callingScreen,
      reasonHelp: screenInfo.find(si => si.fieldName === 'breach_reason')?.fieldText,
      preventHelp: screenInfo.find(si => si.fieldName === 'preventative_steps')?.fieldText,
      riskHelp: screenInfo.find(si => si.fieldName === 'risk_of_serious_harm')?.fieldText,
      recommendationHelp: screenInfo.find(si => si.fieldName === 'recommendation')?.fieldText,
    })
  })

  router.post('/failures/:id', async (req, res, next) => {
    await auditService.logPageView(Page.FAILURES, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const callingScreen: string = req.query.returnTo as string
    let cosso: Cosso = null
    let failures: Failures = null
    let screenInfo: ScreenInformation[] = null

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
      screenInfo = await cossoClient.getScreenInformationForScreen(
        'failures_and_enforcements',
        res.locals.user.username,
      )
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
      failures = await ndeliusIntegrationApiClient.getFailures(cosso.crn, res.locals.user.username)
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

    const existingContacts = asArray(req.body.contact).map(Number)

    const enforceableContactListIds = failures.enforceableContacts?.map(c => c.id)
    for (const contact of cosso.cossoContactList) {
      if (!enforceableContactListIds || !enforceableContactListIds.includes(contact.deliusContactId)) {
        failures.enforceableContacts.push({
          id: contact.deliusContactId,
          datetime: null,
          description: contact.contactTypeDescription,
          type: null,
          outcome: null,
          notes: null,
        })
      }
    }

    cosso.confirmEqualities = req.body.confirmationStatement
    cosso.whyInBreach = req.body.whyInBreach
    cosso.stepsToPreventBreach = req.body.stepsToPreventBreach
    cosso.riskOfHarmChanged = req.body.riskOfHarmChanged
    cosso.riskHistory = req.body.riskHistory
    cosso.recommendations = req.body.recommendationOptions
    cosso.supportingComments = req.body.supportingComments
    cosso.failuresAndEnforcementSaved = true


    const errorMessages: ErrorMessages = validateFailures(cosso)
    const hasErrors: boolean = Object.keys(errorMessages).length > 0

    if (!hasErrors) {
      await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)

      // Add all selected contacts
      const selectedContactList = asArray(req.body.contact)
      const cossoContactIds = cosso.cossoContactList.map(c => c.deliusContactId.toString())
      if (selectedContactList && Object.keys(selectedContactList).length > 0) {
        const contactsToPush: CossoContact[] = []
        for (const selectedContactId of selectedContactList) {
          if (cossoContactIds && !cossoContactIds.includes(selectedContactId)) {
            const selectedContact = failures.enforceableContacts.find(c => c.id.toString() === selectedContactId)
            contactsToPush.push(enforceableContactToContact(cosso, selectedContact, cossoId))
          }
        }
        await cossoClient.batchUpdateContacts(cossoId, contactsToPush, res.locals.user.username)
        cosso.cossoContactList = await cossoClient.getCossoContactsForCosso(cossoId, res.locals.user.username)
      }
      await cossoClient.batchDeleteContacts(
        cosso.cossoContactList.filter(c => !selectedContactList.includes(c.deliusContactId.toString())),
        res.locals.user.username,
      )

      // if the user selected saveProgressAndClose then send a close back to the client
      if (req.body.action === 'saveProgressAndClose') {
        res.send(
          `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
        )
      } else if (callingScreen && callingScreen === 'check-your-report') {
        res.redirect(`/check-your-report/${req.params.id}`)
      } else {
        res.redirect(`/compliance/${cossoId}`)
      }
    } else {
      res.render('pages/failures', {
        errorMessages,
        cosso,
        cossoId,
        currentPage,
        failures,
        existingContacts,
        callingScreen,
        reasonHelp: screenInfo.find(si => si.fieldName === 'breach_reason')?.fieldText,
        preventHelp: screenInfo.find(si => si.fieldName === 'preventative_steps')?.fieldText,
        riskHelp: screenInfo.find(si => si.fieldName === 'risk_of_serious_harm')?.fieldText,
        recommendationHelp: screenInfo.find(si => si.fieldName === 'recommendation')?.fieldText,
      })
    }
  })

  function validateFailures(cosso: Cosso): ErrorMessages {
    const errorMessages: ErrorMessages = {}

    if (cosso.whyInBreach && cosso.whyInBreach.length > 20000) {
      errorMessages.whyInBreach = {
        text: 'Why is this person in breach: This field must be 20000 characters or less',
      }
    }

    if (cosso.stepsToPreventBreach && cosso.stepsToPreventBreach.length > 20000) {
      errorMessages.stepsToPreventBreach = {
        text: 'What steps have been taken to prevent this breach: This field must be 20000 characters or less',
      }
    }

    if (cosso.riskOfHarmChanged && cosso.riskHistory && cosso.riskHistory.length > 20000) {
      errorMessages.riskHistory = {
        text: 'Has the Risk of Serious Harm changed since the order was imposed: This field must be 20000 characters or less',
      }
    }

    if (cosso.supportingComments && cosso.supportingComments.length > 20000) {
      errorMessages.supportingComments = {
        text: 'Comments to support the Recommendation : This field must be 20000 characters or less',
      }
    }

    if (!cosso.confirmEqualities) {
      errorMessages.confirmEqualities = {
        text: 'Confirmation Statement : Please complete the Diversity and equalities confirmation to proceed',
      }
    }

    return errorMessages
  }

  function enforceableContactToContact(
    cosso: Cosso,
    enforceableContact: EnforceableContact,
    cossoId: string,
  ): CossoContact {
    return {
      id: (cosso.cossoContactList ?? [])
        .filter(c => c.deliusContactId === enforceableContact.id)
        .map(c => c.id)
        .at(0),
      deliusContactId: enforceableContact.id,
      cossoId,
      contactTypeDescription: enforceableContact.type.description,
    }
  }

  return router
}
