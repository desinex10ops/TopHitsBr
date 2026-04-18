import React from 'react';
import InfoPageLayout from '../../components/InfoPageLayout/InfoPageLayout';
import { FiMail, FiMessageSquare } from 'react-icons/fi';

const Contact = () => {
    return (
        <InfoPageLayout title="Fale Conosco" breadcrumb="Contato">
            <p>
                Tem alguma dúvida, sugestão ou precisa de suporte? Nossa equipe está pronta para te ajudar.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>

                <div style={{ background: '#222', padding: '30px', borderRadius: '10px', textAlign: 'center' }}>
                    <FiMail style={{ fontSize: '3rem', color: 'var(--dynamic-accent)', marginBottom: '15px' }} />
                    <h3>Suporte Geral</h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Para problemas técnicos ou dúvidas sobre o uso do site.</p>
                    <a href="mailto:suporte@tophitsbr.com" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>suporte@tophitsbr.com</a>
                </div>

                <div style={{ background: '#222', padding: '30px', borderRadius: '10px', textAlign: 'center' }}>
                    <FiMessageSquare style={{ fontSize: '3rem', color: 'var(--dynamic-accent)', marginBottom: '15px' }} />
                    <h3>Parcerias e Imprensa</h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Para propostas comerciais e assessoria de imprensa.</p>
                    <a href="mailto:contato@tophitsbr.com" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>contato@tophitsbr.com</a>
                </div>

            </div>
        </InfoPageLayout>
    );
};

export default Contact;
