import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';

const Advertise = () => {
    return (
        <InfoPageLayout title="Anuncie no TopHitsBr" breadcrumb="Anuncie">
            <p>
                Conecte sua marca a milhões de apaixonados por música em todo o Brasil.
            </p>

            <h2>Nossos Números</h2>
            <div style={{ display: 'flex', gap: '40px', margin: '30px 0', flexWrap: 'wrap' }}>
                <div>
                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--dynamic-accent)', display: 'block' }}>+5M</span>
                    <span style={{ color: '#aaa' }}>Usuários Ativos</span>
                </div>
                <div>
                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--dynamic-accent)', display: 'block' }}>+12M</span>
                    <span style={{ color: '#aaa' }}>Plays Mensais</span>
                </div>
                <div>
                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--dynamic-accent)', display: 'block' }}>+50k</span>
                    <span style={{ color: '#aaa' }}>Artistas Cadastrados</span>
                </div>
            </div>

            <h2>Formatos de Mídia</h2>
            <ul>
                <li><strong>Banners Display:</strong> Home, Player e Páginas de Artistas.</li>
                <li><strong>Áudio Ads:</strong> Spots de 15s ou 30s entre as faixas (para usuários free).</li>
                <li><strong>Playlists Patrocinadas:</strong> Sua marca curando o som do momento.</li>
                <li><strong>Projetos Especiais:</strong> Ações customizadas com nossos artistas parceiros.</li>
            </ul>

            <h2>Entre em Contato</h2>
            <p>
                Para receber nosso Mídia Kit atualizado e discutir oportunidades, envie um email para:
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--dynamic-accent)' }}>
                comercial@tophitsbr.com
            </p>
        </InfoPageLayout>
    );
};

export default Advertise;
