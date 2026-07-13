import express, { Router } from 'express'

export default function setUpWebRequestParsing(): Router {
  const router = express.Router()
  router.use(express.json())
  router.use(express.json({ limit: '1mb' }))
  router.use(express.urlencoded({ extended: true, limit: '1mb' }))
  return router
}
