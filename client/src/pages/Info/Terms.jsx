import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';

const Terms = () => {
    return (
        <InfoPageLayout title="Termos de Uso" breadcrumb="Termos">
            <p><strong>Última atualização: Fevereiro de 2026</strong></p>

            <p>
                Ao acessar e usar o TopHitsBr, você concorda com os seguintes termos e condições. Se você não concordar com alguma parte destes termos, você não deve utilizar nosso serviço.
            </p>

            <h2>1. Uso do Serviço</h2>
            <p>
                O TopHitsBr é uma plataforma de divulgação musical. O conteúdo disponível é fornecido por artistas independentes e parceiros para fins promocionais.
            </p>
            <ul>
                <li>Você concorda em usar o serviço apenas para fins legais e pessoais.</li>
                <li>É proibido usar scripts automatizados para coletar informações ou interagir com o site.</li>
                <li>Você não deve tentar burlar nenhuma medida de segurança do site.</li>
            </ul>

            <h2>2. Conteúdo do Usuário</h2>
            <p>
                Ao enviar conteúdo (músicas, comentários, imagens) para o TopHitsBr, você declara que possui os direitos necessários ou autorização para fazê-lo. O TopHitsBr não reivindica propriedade sobre o seu conteúdo, mas você nos concede uma licença para exibi-lo e distribuí-lo na plataforma.
            </p>

            <h2>3. Propriedade Intelectual</h2>
            <p>
                Respeitamos os direitos de propriedade intelectual de terceiros. Se você acredita que seu trabalho foi copiado de uma forma que constitui violação de direitos autorais, entre em contato conosco imediatamente.
            </p>

            <h2>4. Limitação de Responsabilidade</h2>
            <p>
                O TopHitsBr é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso do site.
            </p>

            <h2>5. Alterações nos Termos</h2>
            <p>
                Podemos modificar estes termos a qualquer momento. Recomendamos que você revise esta página periodicamente. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
            </p>
        </InfoPageLayout>
    );
};

export default Terms;
