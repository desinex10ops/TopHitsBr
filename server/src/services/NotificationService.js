class NotificationService {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // Map<userId, socketId[]>
    }

    init(io) {
        this.io = io;
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('register', (userId) => {
                if (!userId) return;
                console.log(`User ${userId} registered with socket ${socket.id}`);
                this.addUserSocket(String(userId), socket.id);
            });

            socket.on('disconnect', () => {
                this.removeUserSocket(socket.id);
            });
        });
    }

    addUserSocket(userId, socketId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, []);
        }
        this.userSockets.get(userId).push(socketId);
    }

    removeUserSocket(socketId) {
        for (const [userId, sockets] of this.userSockets.entries()) {
            const index = sockets.indexOf(socketId);
            if (index !== -1) {
                sockets.splice(index, 1);
                if (sockets.length === 0) {
                    this.userSockets.delete(userId);
                }
                break;
            }
        }
    }

    /**
     * Creates a notification in the DB and attempts real-time delivery
     */
    async sendToUser(userId, { type, title, message, data }) {
        const { Notification } = require('../database');

        try {
            // 1. Persist to DB
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data
            });

            // 2. Try real-time delivery
            if (this.io) {
                const sockets = this.userSockets.get(String(userId));
                if (sockets && sockets.length > 0) {
                    sockets.forEach(socketId => {
                        this.io.to(socketId).emit('notification', notification);
                    });
                    console.log(`Real-time notification sent to user ${userId}: ${type}`);
                }
            }

            return notification;
        } catch (error) {
            console.error('Failed to create/send notification:', error);
            throw error;
        }
    }

    broadcast(type, payload) {
        if (!this.io) return;
        this.io.emit('notification', { type, ...payload });
    }
}

module.exports = new NotificationService();
