import {Router} from 'express'

import type {Services} from '../services'
import {Page} from '../services/auditService'
import basicDetailsRoutes from './basicDetails'

export default function routes({auditService, hmppsAuthClient, commonUtils}: Services): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })
    res.render('pages/index')
  })

  basicDetailsRoutes(router, auditService, hmppsAuthClient, commonUtils)

  return router
}
