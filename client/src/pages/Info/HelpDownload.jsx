import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';
import { FiDownload, FiCheckCircle } from 'react-icons/fi';

const HelpDownload = () => {
    return (
        <InfoPageLayout title="Como Baixar Músicas" breadcrumb="Ajuda > Downloads">
            <p>
                Baixar suas músicas favoritas no TopHitsBr é simples e rápido. Siga o passo a passo abaixo:
            </p>

            <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                <div style={{ background: '#222', padding: '20px', borderRadius: '8px', display: 'flex', gap: '15px' }}>
                    <div style={{ background: '#1ed760', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Encontre a Música</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>Use a barra de pesquisa ou navegue pelas categorias para encontrar a faixa ou álbum que deseja.</p>
                    </div>
                </div>

                <div style={{ background: '#222', padding: '20px', borderRadius: '8px', display: 'flex', gap: '15px' }}>
                    <div style={{ background: '#1ed760', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Clique no Botão Baixar</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>
                            Ao lado de cada faixa, você verá um ícone de download <FiDownload style={{ verticalAlign: 'middle' }} />. Clique nele.
                        </p>
                    </div>
                </div>

                <div style={{ background: '#222', padding: '20px', borderRadius: '8px', display: 'flex', gap: '15px' }}>
                    <div style={{ background: '#1ed760', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Aguarde o Download</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>O download começará automaticamente. Músicas individuais são baixadas em MP3 de alta qualidade.</p>
                    </div>
                </div>
            </div>

            <h2>Perguntas Frequentes</h2>

            <details style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 'bold', color: '#fff' }}>É gratuito?</summary>
                <p style={{ marginTop: '10px', color: '#ccc' }}>Sim! Todo o conteúdo disponibilizado pelos artistas no TopHitsBr é gratuito para uso pessoal.</p>
            </details>

            <details style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 'bold', color: '#fff' }}>Posso baixar álbuns completos?</summary>
                <p style={{ marginTop: '10px', color: '#ccc' }}>Sim. Na página do álbum, procure pelo botão "Baixar CD Completo" para fazer o download de todas as faixas em um arquivo .ZIP.</p>
            </details>
        </InfoPageLayout>
    );
};

export default HelpDownload;
