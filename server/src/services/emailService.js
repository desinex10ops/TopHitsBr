const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Email Transporter Configuration
// For production, use environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const emailService = {
    /**
     * Send a generic email
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     */
    sendMail: async (to, subject, html) => {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('[EmailService] SMTP credentials missing. Skipping email to:', to);
            return;
        }

        try {
            const info = await transporter.sendMail({
                from: `"TopHitsBr" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });
            console.log('[EmailService] Message sent: %s', info.messageId);
        } catch (error) {
            console.error('[EmailService] Error sending email:', error);
        }
    },

    /**
     * Notify user about a successful purchase
     */
    notifyPurchase: async (user, order, items) => {
        const productList = items.map(item => `
            <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                <strong>${item.Product.title}</strong><br>
                Preço: R$ ${parseFloat(item.price).toFixed(2)}
            </div>
        `).join('');

        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1DB954;">Compra Confirmada! 🎵</h2>
                <p>Olá, ${user.name}!</p>
                <p>Obrigado por sua compra na TopHitsBr. Seu pedido <strong>#${order.id}</strong> foi confirmado.</p>
                
                <h3>Itens do Pedido:</h3>
                ${productList}
                
                <p>Você já pode acessar seus downloads na área "Minhas Compras" do site.</p>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.CLIENT_URL}/dashboard/purchases" 
                       style="background-color: #1DB954; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold;">
                        Acessar Minhas Compras
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <small>Se você não fez esta compra, entre em contato conosco imediatamente.</small>
            </div>
        `;

        await emailService.sendMail(user.email, 'Confirmação de Compra - TopHitsBr', html);
    },

    /**
     * Notify producer about withdrawal status update
     */
    notifyWithdrawalUpdate: async (user, withdrawal) => {
        let statusText = '';
        let color = '';
        let message = '';

        if (withdrawal.status === 'paid') {
            statusText = 'Aprovado e Pago';
            color = '#1DB954'; // Green
            message = `Seu saque de <strong>R$ ${parseFloat(withdrawal.amount).toFixed(2)}</strong> foi processado com sucesso.`;
        } else if (withdrawal.status === 'rejected') {
            statusText = 'Rejeitado';
            color = '#ff4d4d'; // Red
            message = `Seu saque de <strong>R$ ${parseFloat(withdrawal.amount).toFixed(2)}</strong> foi recusado.<br>
            <strong>Motivo:</strong> ${withdrawal.remarks || 'Não informado.'}.<br>
            O valor foi estornado para sua carteira.`;
        }

        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${color};">Atualização de Saque</h2>
                <p>Olá, ${user.name}.</p>
                <p>${message}</p>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
                    <p style="margin: 0;"><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${statusText}</span></p>
                    <p style="margin: 5px 0 0;"><strong>Valor:</strong> R$ ${parseFloat(withdrawal.amount).toFixed(2)}</p>
                    <p style="margin: 5px 0 0;"><strong>Data do Pedido:</strong> ${new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.CLIENT_URL}/dashboard/producer/finance" 
                       style="background-color: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold;">
                        Ver Carteira
                    </a>
                </div>
            </div>
        `;

        await emailService.sendMail(user.email, `Atualização de Saque - TopHitsBr`, html);
    },

    /**
     * Welcome Email
     */
    notifyWelcome: async (user) => {
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1DB954;">Bem-vindo à TopHitsBr! 🚀</h2>
                <p>Olá, ${user.name}!</p>
                <p>Estamos muito felizes em ter você conosco. Agora você tem acesso à melhor plataforma de música e beats do Brasil.</p>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.CLIENT_URL}/dashboard" 
                       style="background-color: #1DB954; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold;">
                        Começar a Explorar
                    </a>
                </div>
            </div>
        `;
        await emailService.sendMail(user.email, 'Bem-vindo à TopHitsBr!', html);
    }
};

module.exports = emailService;
