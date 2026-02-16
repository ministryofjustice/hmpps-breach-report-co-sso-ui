import { Router } from 'express'

import type { Services } from '../services'
import basicDetailsRoutes from './basicDetails'
import reportCompletedRoutes from './reportCompleted'
import checkYourReportRoutes from './check-your-report'
import complianceRoutes from './compliance'
import failuresRoutes from './failures'
import witnessDetailsRoutes from './witness-details'
import offenceDetailsRoutes from './offence-details'
import addAmendmentRoutes from './addAmendment'
import pdfMaintenanceRoutes from './pdfMaintenance'
import confirmDeleteRoutes from './confirm-delete'
import formDeletedRoutes from './form-deleted'

export default function routes({ auditService, hmppsAuthClient, commonUtils }: Services): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    res.render('pages/index')
  })

  router.get('/close', async (req, res, next) => {
    res.send(
      `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
    )
  })

  basicDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)
  checkYourReportRoutes(router, auditService, hmppsAuthClient, commonUtils)
  complianceRoutes(router, auditService, hmppsAuthClient, commonUtils)
  failuresRoutes(router, auditService, hmppsAuthClient, commonUtils)
  offenceDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)
  reportCompletedRoutes(router, auditService, hmppsAuthClient)
  witnessDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)
  addAmendmentRoutes(router, auditService, hmppsAuthClient)
  pdfMaintenanceRoutes(router, auditService, hmppsAuthClient)
  confirmDeleteRoutes(router, auditService, hmppsAuthClient)
  formDeletedRoutes(router, auditService)
  return router
}
