import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';

const Privacy = () => {
    return (
        <InfoPageLayout title="Política de Privacidade" breadcrumb="Privacidade">
            <p>
                Sua privacidade é importante para o TopHitsBr. Esta política explica como coletamos, usamos e protegemos suas informações.
            </p>

            <h2>1. Informações que Coletamos</h2>
            <p>
                Coletamos informações que você nos fornece diretamente (como ao criar uma conta) e informações coletadas automaticamente pelo uso do serviço (como endereço IP, tipo de navegador e dados de uso).
            </p>

            <h2>2. Como Usamos Suas Informações</h2>
            <p>
                Usamos suas informações para:
            </p>
            <ul>
                <li>Fornecer, manter e melhorar nossos serviços.</li>
                <li>Personalizar sua experiência (ex: recomendar músicas).</li>
                <li>Enviar comunicações importantes sobre sua conta ou atualizações do serviço.</li>
                <li>Proteger a segurança e integridade da plataforma.</li>
            </ul>

            <h2>3. Compartilhamento de Informações</h2>
            <p>
                Não vendemos suas informações pessoais para terceiros. Podemos compartilhar dados anonimizados para fins de análise ou com parceiros de serviço que nos ajudam a operar o site, sob estritos acordos de confidencialidade.
            </p>

            <h2>4. Segurança de Dados</h2>
            <p>
                Empregamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração ou destruição.
            </p>

            <h2>5. Seus Direitos</h2>
            <p>
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode gerenciar a maioria dessas configurações diretamente no seu painel de usuário ou entrar em contato com nosso suporte.
            </p>
        </InfoPageLayout>
    );
};

export default Privacy;
