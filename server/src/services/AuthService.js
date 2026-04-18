const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/UserRepository');
const AppError = require('../utils/AppError');

class AuthService {
    constructor() {
        if (!process.env.JWT_SECRET) {
            throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
        }
        this.secret = process.env.JWT_SECRET;
        this.expiresIn = '7d';
    }

    async register({ name, email, password, type, artisticName }) {
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError('Email já cadastrado.', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await UserRepository.create({
            name,
            email,
            password: hashedPassword,
            type: type || 'listener',
            artisticName: (type === 'artist' || type === 'admin') ? artisticName : null
        });

        const token = this.signToken(newUser);

        if (newUser.type === 'artist') {
            try {
                const { AdminNotification } = require('../database');
                if (AdminNotification) {
                    await AdminNotification.create({
                        type: 'info',
                        title: 'Novo Produtor Registrado',
                        message: `O usuário ${newUser.name} se cadastrou como produtor.`,
                        link: `/admin/users`
                    });
                }
            } catch (err) {
                console.error('Failed to create AdminNotification:', err);
            }
        }

        return { user: newUser, token };
    }

    async login(email, password) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Credenciais inválidas.', 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Credenciais inválidas.', 400);
        }

        const token = this.signToken(user);
        return { user, token };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw new AppError('Senha atual incorreta.', 400);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save(); // Direct save for now, could move to Repo 'updatePassword'

        return true;
    }

    async updatePreferences(userId, { notifications, darkMode }) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        user.preferences = { notifications, darkMode };
        await user.save();

        return user.preferences;
    }

    signToken(user) {
        return jwt.sign({ id: user.id, type: user.type }, this.secret, { expiresIn: this.expiresIn });
    }
}

module.exports = new AuthService();
