import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';
import { Link } from 'react-router-dom';

const HelpLogin = () => {
    return (
        <InfoPageLayout title="Cadastro e Login" breadcrumb="Ajuda > Acesso">
            <p>
                Ter uma conta no TopHitsBr permite que você crie playlists, siga artistas e tenha um histórico personalizado.
            </p>

            <h2>Como Criar uma Conta</h2>
            <ol style={{ paddingLeft: '20px', color: '#ccc', lineHeight: '1.8' }}>
                <li>Clique em <strong>"Criar conta"</strong> no canto superior direito ou <Link to="/register" style={{ color: 'var(--dynamic-accent)' }}>clique aqui</Link>.</li>
                <li>Preencha seus dados (Nome, Email e Senha) ou use o login social (Google/Facebook).</li>
                <li>Confirme seu email se solicitado.</li>
                <li>Pronto! Agora você pode aproveitar todos os recursos.</li>
            </ol>

            <h2>Esqueci minha senha</h2>
            <p>
                Se você não consegue acessar sua conta:
            </p>
            <ol style={{ paddingLeft: '20px', color: '#ccc', lineHeight: '1.8' }}>
                <li>Na tela de login, clique em <strong>"Esqueceu a senha?"</strong>.</li>
                <li>Digite o email cadastrado.</li>
                <li>Você receberá um link para redefinir sua senha.</li>
            </ol>

            <h2>Sou Artista. Como crio um perfil?</h2>
            <p>
                Para artistas, o processo é o mesmo de criação de conta comum. Após criar sua conta, acesse o painel e procure pela opção <strong>"Tornar-se um Artista"</strong> para solicitar a verificação do seu perfil e começar a enviar músicas.
            </p>
        </InfoPageLayout>
    );
};

export default HelpLogin;
