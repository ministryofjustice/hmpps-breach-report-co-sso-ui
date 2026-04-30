import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso, CossoRequirement, ScreenInformation } from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'
import NDeliusIntegrationApiClient, { ReferenceData, Requirements } from '../data/ndeliusIntegrationApiClient'
import { ErrorMessages } from '../data/uiModels'
import asArray, { handleIntegrationErrors } from '../utils/utils'

export default function complianceRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'compliance'

  router.get('/compliance/:id', async (req, res) => {
    await auditService.logPageView(Page.COMPLIANCE, { who: res.locals.user.username, correlationId: req.id })

    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const callingScreen: string = req.query.returnTo as string

    let cosso: Cosso = null
    let requirements: Requirements = null
    let errorMessages: ErrorMessages = {}
    let screenInfo: ScreenInformation[] = null

    try {
      cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)
      if (Object.keys(cosso).length === 0) {
        errorMessages.genericErrorMessage = {
          text: 'The document has not been found or has been deleted. An error has been logged. 404',
        }
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }
      screenInfo = await cossoClient.getScreenInformationForScreen('compliance', res.locals.user.username)
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
      res.render(`pages/compliance`, { errorMessages, showEmbeddedError })
      return
    }

    try {
      requirements = await ndeliusIntegrationApiClient.getRequirements(cossoId)
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

    const uiRequirements: UiRequirement[] = []

    for (let i = 0; i < requirements.requirements.length; i += 1) {
      const ext = requirements.requirements[i]

      const existing = cosso?.requirementList?.find(r => r.deliusRequirementId === ext.id)

      uiRequirements.push({
        uiId: i + 1,
        deliusRequirementId: ext.id,
        dbId: existing?.id ?? null,
        existing: !!existing,
        type: ext.type,
        subType: ext.subType,
        notes: existing?.notes ?? '',
        failure: existing?.failure ?? null,
        failureReason: existing?.failureReason ?? null,
        requirementTypeMainCategoryDescription: ext.type.description,
        requirementTypeSubCategoryDescription: ext.subType.description,
      })
    }

    const breachItems = [
      { text: 'Select Breach Reason', value: '-1' },
      ...requirements.breachReasons.map(br => ({
        text: br.description,
        value: br.description,
      })),
    ]

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/compliance', {
      cosso,
      cossoId,
      currentPage,
      callingScreen,
      uiRequirements,
      breachItems,
      complianceToHelp: screenInfo.find(si => si.fieldName === 'compliance_to_date')?.fieldText,
    })
  })

  router.post('/compliance/:id', async (req, res) => {
    await auditService.logPageView(Page.COMPLIANCE, { who: res.locals.user.username, correlationId: req.id })

    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoClient = new CossoApiClient(authenticationClient)

    const cossoId: string = req.params.id
    const callingScreen: string = req.query.returnTo as string

    let cosso: Cosso = null
    let requirements: Requirements = null
    let screenInfo: ScreenInformation[] = null
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
      screenInfo = await cossoClient.getScreenInformationForScreen('compliance', res.locals.user.username)
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
      res.render(`pages/compliance`, { errorMessages, showEmbeddedError })
      return
    }

    try {
      requirements = await ndeliusIntegrationApiClient.getRequirements(cossoId)
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

    const breachItems = [
      { text: 'Select Breach Reason', value: '-1' },
      ...requirements.breachReasons.map(br => ({
        text: br.description,
        value: br.description,
      })),
    ]

    const uiRequirements: UiRequirement[] = []

    for (let i = 0; i < requirements.requirements.length; i += 1) {
      const ext = requirements.requirements[i]

      const existing = cosso.requirementList.find(r => r.deliusRequirementId === ext.id)

      uiRequirements.push({
        // Ui id is a dummy id we use for the front end, rather than exposing real ids
        uiId: i + 1,
        deliusRequirementId: ext.id,
        dbId: existing?.id ?? null,
        existing: !!existing,
        type: ext.type,
        subType: ext.subType,
        notes: existing?.notes ?? '',
        failure: existing?.failure ?? null,
        failureReason: existing?.failureReason ?? null,
        requirementTypeMainCategoryDescription: ext.type.description,
        requirementTypeSubCategoryDescription: ext.subType.description,
      })
    }

    cosso.complianceToDate = req.body.complianceToDate

    const selectedRequirementList = asArray(req.body.requirement).map(Number)

    const textFieldErrors = validateTextFields(cosso)
    errorMessages = { ...errorMessages, ...textFieldErrors }

    const rawNotesList = Object.entries(req.body).filter(([key]) => key.startsWith('notes_'))

    const extractedNotes = rawNotesList.map(([key, value]) => {
      const id = Number(key.split('_')[1])
      return { id, notes: value as string }
    })

    const requirementsToPush: CossoRequirement[] = []

    for (const reqItem of uiRequirements) {
      const { uiId } = reqItem
      const deliusId = reqItem.deliusRequirementId
      const outerChecked = selectedRequirementList.includes(uiId)

      const value = req.body[`requirement_${uiId}`]

      let failure

      if (value === 'Yes') {
        failure = true
      } else if (value === 'No') {
        failure = false
      } else {
        failure = null
      }

      const failureReasonDesc = failure === true ? req.body[`failureReason_${uiId}`] : null

      let failureReason = null
      if (failureReasonDesc) {
        const br = requirements.breachReasons.find(b => b.description === failureReasonDesc)
        failureReason = br?.description ?? null
      }

      const notes = extractedNotes.find(n => n.id === uiId).notes ?? null

      reqItem.notes = notes
      reqItem.failure = failure
      reqItem.failureReason = failureReason
      reqItem.existing = outerChecked

      if (outerChecked) {
        if (failure === true && (!failureReason || failureReason === '-1')) {
          errorMessages.failureNotSelected = {
            text: 'Please select a valid breach reason for each failed requirement',
          }
        }

        if (notes && notes.length > 20000) {
          errorMessages.requirementNotesLength = {
            text: 'Please ensure requirement notes are less than 20000 characters',
          }
        }

        requirementsToPush.push({
          id: reqItem.dbId,
          deliusRequirementId: deliusId,
          cossoId,
          requirementTypeMainCategoryDescription: reqItem.requirementTypeMainCategoryDescription,
          requirementTypeSubCategoryDescription: reqItem.requirementTypeSubCategoryDescription,
          failure,
          failureReason,
          notes,
          requirementLength: '',
          requirementSecondLength: '',
        })
      }
    }

    const hasErrors: boolean = Object.keys(errorMessages).length > 0

    if (!hasErrors) {
      await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)
      await cossoClient.batchUpdateRequirements(cossoId, requirementsToPush, res.locals.user.username)

      cosso.requirementList = await cossoClient.getCossoRequirementsForCosso(cossoId, res.locals.user.username)

      const toDelete = cosso.requirementList.filter(
        r => !requirementsToPush.some(p => p.deliusRequirementId === r.deliusRequirementId),
      )
      await cossoClient.batchDeleteRequirements(toDelete, res.locals.user.username)

      if (req.body.action === 'saveProgressAndClose') {
        await cossoClient.updateCosso(req.params.id, cosso, res.locals.user.username)
        res.send(
          `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
        )
      } else if (callingScreen === 'check-your-report') {
        res.redirect(`/check-your-report/${cossoId}`)
      } else {
        res.redirect(`/sign-and-send/${cossoId}`)
      }
    } else {
      res.render('pages/compliance', {
        errorMessages,
        cosso,
        cossoId,
        currentPage,
        callingScreen,
        uiRequirements,
        breachItems,
        complianceToHelp: screenInfo.find(si => si.fieldName === 'compliance_to_date')?.fieldText,
      })
    }
  })

  function validateTextFields(cosso: Cosso): ErrorMessages {
    const errorMessages: ErrorMessages = {}
    if (cosso.complianceToDate && cosso.complianceToDate.length > 20000) {
      errorMessages.complianceToDate = {
        text: 'This field must be 20000 characters or less',
      }
    }
    return errorMessages
  }

  return router
}

export interface UiRequirement {
  uiId: number
  dbId: string
  deliusRequirementId: number
  existing: boolean
  type: ReferenceData
  subType: ReferenceData
  notes: string
  failure: boolean
  failureReason: string
  requirementTypeMainCategoryDescription: string
  requirementTypeSubCategoryDescription: string
}
