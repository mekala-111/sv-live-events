import { createServer } from 'http';
import { Server } from 'socket.io';
import app, { getPort, logger } from './app.js';
import { prisma } from './lib/prisma.js';
import { assertProductionSecrets } from './middleware/securityHardening.js';
import { warmCaches } from './lib/cache.js';
import { ensureDefaultNodes } from './services/cluster.js';

const port = getPort();

try {
  assertProductionSecrets();
} catch (err) {
  logger.error((err as Error).message);
  process.exit(1);
}

const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join-live', async (bookingId: string) => {
    const room = `live:${bookingId}`;
    await socket.join(room);
    logger.info(`Socket ${socket.id} joined ${room}`);
    socket.emit('joined', { room, bookingId });
  });

  socket.on('join-stream', async (streamId: string) => {
    const room = `stream:${streamId}`;
    await socket.join(room);
    socket.emit('joined-stream', { room, streamId });
  });

  socket.on('leave-stream', (streamId: string) => {
    socket.leave(`stream:${streamId}`);
  });

  socket.on('stream-chat-message', async (data: {
    streamId: string;
    sender: string;
    message: string;
    emoji?: string;
  }) => {
    try {
      const { streamId, sender, message, emoji } = data;
      if (!streamId || !sender || !message) return;
      const chatMessage = await prisma.streamChatMessage.create({
        data: { streamId, sender, message, emoji },
      });
      io.to(`stream:${streamId}`).emit('stream-chat', chatMessage);
    } catch (err) {
      logger.error(`Stream chat error: ${(err as Error).message}`);
    }
  });

  socket.on('stream-chat-broadcast', (msg: unknown) => {
    const streamId = (msg as { streamId?: string })?.streamId;
    if (!streamId) return;
    io.to(`stream:${streamId}`).emit('stream-chat', msg);
  });

  socket.on('stream-typing', (data: { streamId: string; sender: string; typing: boolean }) => {
    if (!data?.streamId || !data?.sender) return;
    socket.to(`stream:${data.streamId}`).emit('stream-typing', data);
  });

  socket.on('chat-message', async (data: { bookingId: string; sender: string; message: string; emoji?: string }) => {
    try {
      const { bookingId, sender, message, emoji } = data;
      if (!bookingId || !sender || !message) return;

      const chatMessage = await prisma.chatMessage.create({
        data: { bookingId, sender, message, emoji },
      });

      io.to(`live:${bookingId}`).emit('chat-message', chatMessage);
    } catch (err) {
      logger.error(`Chat message error: ${(err as Error).message}`);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('leave-live', (bookingId: string) => {
    socket.leave(`live:${bookingId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  logger.info(`SV Live Events API running on http://localhost:${port}`);
  logger.info(`Socket.IO ready for live chat rooms`);
  void (async () => {
    try {
      await ensureDefaultNodes();
      const live = await prisma.stream.findMany({
        where: { status: { in: ['LIVE', 'WAITING', 'SCHEDULED'] } },
        select: { slug: true },
        take: 100,
      });
      await warmCaches(live.map((s) => s.slug));
    } catch (err) {
      logger.warn(`Startup warm failed: ${(err as Error).message}`);
    }
  })();
});

export { io };
