import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';

const Cookies = () => {
    return (
        <InfoPageLayout title="Política de Cookies" breadcrumb="Cookies">
            <p>
                O TopHitsBr utiliza cookies e tecnologias similares para melhorar sua experiência de navegação.
            </p>

            <h2>O que são Cookies?</h2>
            <p>
                Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles permitem que o site se lembre de suas ações e preferências ao longo do tempo.
            </p>

            <h2>Tipos de Cookies que Usamos</h2>
            <ul>
                <li><strong>Essenciais:</strong> Necessários para o funcionamento básico do site (ex: manter você logado).</li>
                <li><strong>Desempenho:</strong> Nos ajudam a entender como os visitantes interagem com o site, coletando informações anonimamente.</li>
                <li><strong>Funcionalidade:</strong> Permitem que o site lembre de suas escolhas (como seu nome de usuário ou idioma) para oferecer uma experiência mais personalizada.</li>
                <li><strong>Publicidade:</strong> Usados para fornecer anúncios mais relevantes para você e seus interesses.</li>
            </ul>

            <h2>Gerenciando Cookies</h2>
            <p>
                Você pode controlar e/ou excluir cookies conforme desejar através das configurações do seu navegador. Note que desativar cookies essenciais pode afetar o funcionamento do TopHitsBr.
            </p>
        </InfoPageLayout>
    );
};

export default Cookies;
