import { Router } from 'express'

import type { Services } from '../services'
import basicDetailsRoutes from './basicDetails'
import reportCompletedRoutes from './reportCompleted'
import checkYourReportRoutes from './check-your-report'
import complianceRoutes from './compliance'
import failuresRoutes from './failures'
import witnessDetailsRoutes from './witness-details'
import offenceDetailsRoutes from './offence-details'

export default function routes({ auditService, hmppsAuthClient, commonUtils }: Services): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    res.render('pages/index')
  })

  basicDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)
  checkYourReportRoutes(router, auditService, hmppsAuthClient, commonUtils)
  complianceRoutes(router, auditService, hmppsAuthClient, commonUtils)
  failuresRoutes(router, auditService, hmppsAuthClient, commonUtils)
  offenceDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)
  reportCompletedRoutes(router, auditService, hmppsAuthClient)
  witnessDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)

  return router
}
