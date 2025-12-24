import { Router } from 'express'

import type { Services } from '../services'
import basicDetailsRoutes from './basicDetails'
import reportCompletedRoutes from './reportCompleted'

export default function routes({ auditService, hmppsAuthClient, commonUtils }: Services): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    res.render('pages/index')
  })

  basicDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)
  reportCompletedRoutes(router, auditService, hmppsAuthClient)

  return router
}
