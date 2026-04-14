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

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173' }))
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
