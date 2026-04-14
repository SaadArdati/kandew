import express from 'express'
import boardRoutes from './task/boardRoutes.js'
import cardRoutes from './task/cardRoutes.js'

const router = express.Router()

router.use(boardRoutes)
router.use(cardRoutes)

export default router
