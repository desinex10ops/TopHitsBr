const { Conversation, Message, User, sequelize } = require('../database');
const { Op } = require('sequelize');
const NotificationService = require('../services/NotificationService');

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [{ user1Id: userId }, { user2Id: userId }]
            },
            include: [
                { model: User, as: 'User1', attributes: ['id', 'name', 'avatar'] },
                { model: User, as: 'User2', attributes: ['id', 'name', 'avatar'] },
                { model: Message, limit: 1, order: [['createdAt', 'DESC']] }
            ],
            order: [['updatedAt', 'DESC']]
        });

        // Format for frontend
        const formatted = conversations.map(c => {
            const otherUser = c.user1Id === userId ? c.User2 : c.User1;
            const lastMessage = c.Messages && c.Messages.length > 0 ? c.Messages[0] : null;
            return {
                id: c.id,
                otherUser,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    read: lastMessage.read,
                    senderId: lastMessage.senderId
                } : null,
                updatedAt: c.updatedAt
            };
        });

        res.json(formatted);

    } catch (error) {
        console.error("Erro ao buscar conversas:", error);
        res.status(500).json({ error: 'Erro ao buscar conversas.' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversa não encontrada.' });
        }

        // Check permission
        if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
            return res.status(403).json({ error: 'Sem permissão.' });
        }

        const messages = await Message.findAll({
            where: { conversationId },
            order: [['createdAt', 'ASC']],
            include: [{ model: User, as: 'Sender', attributes: ['id', 'name', 'avatar'] }]
        });

        // Mark as read (only messages sent by OTHER user)
        await Message.update({ read: true }, {
            where: {
                conversationId,
                senderId: { [Op.ne]: userId },
                read: false
            }
        });

        res.json(messages);

    } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
};

exports.startConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const userId = req.user.id; // Corrected: req.user.id not req.userId

        if (userId == recipientId) {
            return res.status(400).json({ error: 'Você não pode conversar com você mesmo.' });
        }

        // Check if exists
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { user1Id: userId, user2Id: recipientId },
                    { user1Id: recipientId, user2Id: userId }
                ]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                user1Id: userId,
                user2Id: recipientId
            });
        }

        res.json({ id: conversation.id });

    } catch (error) {
        console.error("Erro ao iniciar conversa:", error);
        res.status(500).json({ error: 'Erro ao iniciar conversa.' });
    }
};

exports.sendMessage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { conversationId, content } = req.body;
        const userId = req.user.id;

        const conversation = await Conversation.findByPk(conversationId, { transaction: t });
        if (!conversation) {
            await t.rollback();
            return res.status(404).json({ error: 'Conversa não encontrada.' });
        }

        // Permission check
        if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
            await t.rollback();
            return res.status(403).json({ error: 'Sem permissão.' });
        }

        const message = await Message.create({
            conversationId,
            senderId: userId,
            content,
            read: false
        }, { transaction: t });

        // Update conversation timestamp
        conversation.changed('updatedAt', true);
        await conversation.save({ transaction: t });

        await t.commit();

        const recipientId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

        // Real-time Notification
        await NotificationService.sendToUser(recipientId, {
            type: 'chat_message',
            title: 'Nova Mensagem',
            message: `Nova mensagem de ${req.user.name}`,
            data: {
                conversationId,
                message: message.toJSON()
            }
        });

        res.status(201).json(message);

    } catch (error) {
        await t.rollback();
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).json({ error: 'Erro ao enviar mensagem.' });
    }
};
