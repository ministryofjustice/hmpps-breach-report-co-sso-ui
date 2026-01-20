import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { CossoAmendment } from '../data/cossoApiClient'
import { ErrorMessages } from '../data/uiModels'
import { fromUserDate, toUserDate } from '../utils/dateUtils'
import { handleIntegrationErrors } from '../utils/utils'

export default function addAmendmentRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
): Router {
  const currentPage = 'add-amendment'

  router.get('/add-amendment/:id', async (req, res) => {
    await auditService.logPageView(Page.BASIC_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const currentAmendmentId: string = req.query.amendmentid as string
    let amendment: CossoAmendment

    if (currentAmendmentId) {
      try {
        amendment = await cossoClient.getAmendmentById(currentAmendmentId, res.locals.user.username)
        if (Object.keys(amendment).length === 0) {
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
        res.render(`pages/add-amendment`, { errorMessages, showEmbeddedError })
        return
      }
    } else {
      amendment = {
        amendmentReason: null,
        amendmentDate: null,
        amendmentDetails: null,
        cossoId,
      }
    }

    const currentAmendmentDate = toUserDate(amendment.amendmentDate)

    res.render('pages/add-amendment', {
      amendment,
      cossoId,
      currentPage,
      currentAmendmentId,
      currentAmendmentDate,
    })
  })

  router.post('/add-amendment/:id', async (req, res, next) => {
    await auditService.logPageView(Page.BASIC_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const currentAmendmentId: string = req.body.currentAmendmentId as string
    let amendment: CossoAmendment

    // if cancel selected skip right back
    if (req.body.action === 'cancel') {
      res.redirect(`/offence-details/${cossoId}`)
    } else {
      amendment = {
        id: currentAmendmentId,
        cossoId,
        amendmentReason: req.body.amendmentreason,
        amendmentDetails: req.body.amendmentdetail,
        amendmentDate: fromUserDate(req.body.amendmentdate),
      }

      const errorMessages: ErrorMessages = validateAmendment(amendment)
      const hasErrors: boolean = Object.keys(errorMessages).length > 0

      if (!hasErrors) {
        try {
          if (currentAmendmentId) {
            await cossoClient.updateAmendment(currentAmendmentId, amendment, res.locals.user.username)
          } else {
            await cossoClient.createAmendment(amendment, res.locals.user.username)
          }
          res.redirect(`/offence-details/${cossoId}`)
        } catch (error) {
          const integrationErrorMessages = handleIntegrationErrors(
            error.status,
            error.data?.message,
            'Breach Report CO SSO',
          )
          const showEmbeddedError = true
          res.render(`pages/add-amendment`, { errorMessages, showEmbeddedError, integrationErrorMessages })
        }
      } else {
        const currentAmendmentDate = toUserDate(amendment.amendmentDate)
        res.render('pages/add-amendment', {
          errorMessages,
          amendment,
          cossoId,
          currentPage,
          currentAmendmentId,
          currentAmendmentDate,
        })
      }
    }
  })

  function validateAmendment(amendment: CossoAmendment): ErrorMessages {
    const errorMessages: ErrorMessages = {}

    if (!amendment.amendmentDetails || amendment.amendmentDetails.trim() === '') {
      errorMessages.amendmentDetails = {
        text: 'Details of Amendment: This is a required value, please enter a value',
      }
    } else if (amendment.amendmentDetails.length > 20000) {
      errorMessages.amendmentDetails = {
        text: 'Details of Amendment: This field must be 20000 characters or less',
      }
    }

    if (!amendment.amendmentReason || amendment.amendmentReason.trim() === '') {
      errorMessages.amendmentReason = {
        text: 'Reason for Amendment: This is a required value, please enter a value',
      }
    } else if (amendment.amendmentReason.length > 20000) {
      errorMessages.amendmentReason = {
        text: 'Reason for Amendment: This field must be 20000 characters or less',
      }
    }

    if (!amendment.amendmentDate || amendment.amendmentDate.trim() === '') {
      errorMessages.amendmentDate = {
        text: 'Date of Amendment: This is a required value, please enter a value',
      }
    }

    return errorMessages
  }

  return router
}
