/**
 * Custom Next.js server with Socket.IO
 * Provides real-time features:
 *  - Lead engagement alerts (hot leads)
 *  - Inbox message notifications
 *  - Incoming call routing
 *  - Agent availability tracking
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  // Track online agents: { agentId: socketId }
  const onlineAgents = new Map()

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`)

    // Agent joins their personal room
    socket.on('join:agent', ({ userId }) => {
      if (userId) {
        socket.join(`agent:${userId}`)
        onlineAgents.set(userId, socket.id)
        io.emit('agent:online', { userId, online: true })
      }
    })

    // Join a business broadcast room
    socket.on('join:business', ({ businessId }) => {
      if (businessId) socket.join(`business:${businessId}`)
    })

    // Join a conversation room for real-time messages
    socket.on('join:conversation', ({ conversationId }) => {
      if (conversationId) socket.join(`conversation:${conversationId}`)
    })

    socket.on('leave:conversation', ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`)
    })

    // Typing indicator
    socket.on('agent:typing', ({ conversationId, isTyping, agentId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', { agentId, isTyping })
    })

    // Agent status change
    socket.on('agent:status', ({ userId, status }) => {
      io.emit('agent:status:update', { userId, status })
    })

    socket.on('disconnect', () => {
      // Remove from online agents
      for (const [userId, sid] of onlineAgents.entries()) {
        if (sid === socket.id) {
          onlineAgents.delete(userId)
          io.emit('agent:online', { userId, online: false })
          break
        }
      }
      console.log(`[Socket] Client disconnected: ${socket.id}`)
    })
  })

  // Expose io so API routes can emit events
  // Internal HTTP endpoint to broadcast events from Next.js API routes
  httpServer._io = io

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.IO running on /api/socket`)
  })
})
