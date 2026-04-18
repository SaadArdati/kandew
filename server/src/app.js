import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import teamRoutes from './routes/teams.js'
import { errorHandler } from './middleware/errorHandler.js'
import { swaggerSpec } from './swagger.js'

import taskRoutes from './routes/tasks.js'
import commentRoutes from './routes/comments.js'

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Configure it in server/.env before starting.')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/teams', taskRoutes)
app.use('/api', commentRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
