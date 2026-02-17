const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    type: z.enum(['listener', 'artist', 'producer', 'admin']).optional(),
    artisticName: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória')
});

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: error.errors.map(e => e.message)
        });
    }
};

module.exports = {
    registerSchema,
    loginSchema,
    validate
};
