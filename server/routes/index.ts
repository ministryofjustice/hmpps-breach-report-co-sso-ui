import { Router } from 'express'

import type { Services } from '../services'
import basicDetailsRoutes from './basicDetails'

export default function routes({ auditService, hmppsAuthClient }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    res.render('pages/index')
  })

  basicDetailsRoutes(router, auditService, hmppsAuthClient)

  return router
}
