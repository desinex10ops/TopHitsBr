import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';

const About = () => {
    return (
        <InfoPageLayout title="Sobre o TopHitsBr" breadcrumb="Sobre">
            <p>
                Bem-vindo ao <strong>TopHitsBr</strong>, a maior plataforma de entretenimento e divulgação musical do Brasil focada em ritmos regionais.
            </p>

            <h2>Nossa Missão</h2>
            <p>
                Nossa missão é democratizar o acesso à música, permitindo que artistas independentes de todo o país - especialmente do Norte e Nordeste - tenham um espaço de qualidade para divulgar seu trabalho e alcançar milhões de fãs.
            </p>

            <h2>Para os Fãs</h2>
            <p>
                Oferecemos uma experiência única, rápida e gratuita. Aqui você encontra os últimos lançamentos de Forró, Piseiro, Arrocha, Bregadeira e muito mais. Nossa plataforma foi desenhada para ser leve e acessível, permitindo que você ouça e baixe suas músicas favoritas onde estiver.
            </p>

            <h2>Para os Artistas</h2>
            <p>
                O TopHitsBr é uma vitrine poderosa. Fornecemos ferramentas para que bandas e cantores possam gerenciar seus perfis, acompanhar estatísticas e conectar-se diretamente com seu público. Acreditamos que o talento está em todo lugar, e nossa tecnologia serve para amplificar essas vozes.
            </p>

            <h2>Nossa História</h2>
            <p>
                Fundado com a paixão pela música popular brasileira, o TopHitsBr cresceu organicamente graças à comunidade vibrante de artistas e ouvintes que construímos juntos. O que começou como um pequeno projeto de divulgação tornou-se referência nacional em lançamentos musicais.
            </p>
        </InfoPageLayout>
    );
};

export default About;
