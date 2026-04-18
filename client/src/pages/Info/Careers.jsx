import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';

const Careers = () => {
    return (
        <InfoPageLayout title="Trabalhe Conosco" breadcrumb="Carreiras">
            <p>
                O TopHitsBr está sempre em busca de talentos apaixonados por música, tecnologia e cultura brasileira.
            </p>

            <h2>Vagas Abertas</h2>
            <p>
                No momento, não temos vagas abertas específicas, mas estamos sempre criando novas oportunidades.
            </p>

            <p>
                Se você é desenvolvedor, designer, curador musical ou especialista em marketing digital e quer fazer parte da nossa revolução musical, envie seu currículo e portfólio para:
            </p>

            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--dynamic-accent)' }}>
                carreiras@tophitsbr.com
            </p>

            <h2>Por que trabalhar aqui?</h2>
            <ul>
                <li>Ambiente 100% remoto e flexível.</li>
                <li>Impacto real na vida de artistas independentes.</li>
                <li>Cultura de inovação e aprendizado contínuo.</li>
                <li>Acesso antecipado a lançamentos musicais.</li>
            </ul>
        </InfoPageLayout>
    );
};

export default Careers;
