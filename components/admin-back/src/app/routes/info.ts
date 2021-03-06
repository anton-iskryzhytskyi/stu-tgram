import { Router } from 'express'
import { InitRoutes } from './index'
import { create, update, remove, get, getCategories } from '../handlers/info'
import { authMiddleware } from '../services/auth'

export const initRoutes: InitRoutes = async () => {
  const router = Router()

  router.get(['/categories'], authMiddleware, getCategories)
  router.post('/', authMiddleware, create)
  router.delete('/:id', authMiddleware, remove)
  router.patch('/:id', authMiddleware, update)
  router.get(['/:id', '/'], authMiddleware, get)

  return router
}
