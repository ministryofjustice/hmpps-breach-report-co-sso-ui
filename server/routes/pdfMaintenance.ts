import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import { ErrorMessages } from '../data/uiModels'
import { handleIntegrationErrors } from '../utils/utils'
import CossoApiClient from '../data/cossoApiClient'

export default function pdfMaintenanceRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
): Router {
  router.get('/pdf/:id', async (req, res) => {
    await auditService.logPageView(Page.VIEW_PDF, { who: res.locals.user.username, correlationId: req.id })

    const cossoId: string = req.params.id

    const cossoApiClient = new CossoApiClient(authenticationClient)
    const cosso = await cossoApiClient.getCossoById(req.params.id as string, res.locals.user.username)

    try {
      const stream: ArrayBuffer = await cossoApiClient.getDraftPdfById(cossoId, res.locals.user.username)

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `filename="suicide_risk_form_${cosso.crn}_draft.pdf"`)
      res.send(stream)
    } catch (error) {
      const errorMessages: ErrorMessages = handleIntegrationErrors(
        error.status,
        error.data?.message,
        'NDelius Integration',
      )

      res.render(`pages/pdf-generation-failed`, { errorMessages })
    }
  })

  return router
}
