import { Router } from 'express'
import { InitRoutes } from './index'
import { uploadEducationProcessSchedule, compilePNGs } from '../handlers/files'
import { authMiddleware } from '../services/auth'
import { keepAlive } from '../middlewares/keep-alive'

export const initRoutes: InitRoutes = async ({ uploader }) => {
  const router = Router()

  router.put('/schedule/upload-education-process', authMiddleware, uploader.single('schedule-xlsx'), uploadEducationProcessSchedule)
  router.post('/schedule/compile-images', authMiddleware, keepAlive, compilePNGs)

  return router
}
