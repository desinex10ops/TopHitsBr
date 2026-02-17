const { Notification } = require('../database');

exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOne({
            where: { id, userId: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notificação não encontrada.' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Notificação marcada como lida.', notification });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.user.id, isRead: false } }
        );

        res.json({ message: 'Todas as notificações foram marcadas como lidas.' });
    } catch (error) {
        next(error);
    }
};
