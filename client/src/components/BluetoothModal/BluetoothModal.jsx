import React, { useEffect, useState } from 'react';
import styles from './BluetoothModal.module.css';
import { FiBluetooth, FiSmartphone, FiMonitor, FiTablet, FiSettings } from 'react-icons/fi';
import { FaApple, FaAndroid, FaWindows } from 'react-icons/fa';

const BluetoothModal = ({ onClose }) => {
    const [os, setOs] = useState('unknown');

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.includes('android')) {
            setOs('android');
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            setOs('ios');
        } else if (userAgent.includes('win')) {
            setOs('windows');
        } else if (userAgent.includes('mac')) {
            setOs('mac');
        } else {
            setOs('unknown');
        }
    }, []);

    const renderContent = () => {
        switch (os) {
            case 'android':
                return (
                    <>
                        <div className={styles.osInfo}>
                            <FaAndroid /> Detectado: Android
                        </div>
                        <p className={styles.description}>
                            Para conectar sua caixa de som ou fone:
                        </p>
                        {/* Android Intent Scheme for Bluetooth Settings */}
                        <a href="intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end" className={styles.actionButton}>
                            <FiSettings /> Abrir Configurações Bluetooth
                        </a>
                        <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '5px' }}>
                            (Se não abrir, vá em Configurações &gt; Conexões &gt; Bluetooth)
                        </p>
                    </>
                );
            case 'windows':
                return (
                    <>
                        <div className={styles.osInfo}>
                            <FaWindows /> Detectado: Windows
                        </div>
                        <p className={styles.description}>
                            Clique abaixo para abrir o painel de dispositivos do Windows:
                        </p>
                        <a href="ms-settings:bluetooth" className={styles.actionButton}>
                            <FiSettings /> Abrir Painel Bluetooth
                        </a>
                    </>
                );
            case 'ios':
                return (
                    <>
                        <div className={styles.osInfo}>
                            <FaApple /> Detectado: iPhone/iPad
                        </div>
                        <p className={styles.description}>
                            A Apple não permite abrir ajustes automaticamente. Siga os passos:
                        </p>
                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <span>Abra o app <strong>Ajustes</strong></span>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <span>Toque em <strong>Bluetooth</strong></span>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <span>Selecione seu dispositivo na lista</span>
                            </div>
                        </div>
                    </>
                );
            case 'mac':
                return (
                    <>
                        <div className={styles.osInfo}>
                            <FaApple /> Detectado: Mac
                        </div>
                        <p className={styles.description}>
                            No seu Mac, siga estes passos:
                        </p>
                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <span>Clique no ícone da <strong>Apple ()</strong> &gt; Ajustes do Sistema</span>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <span>Vá em <strong>Bluetooth</strong></span>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <span>Conecte seu dispositivo</span>
                            </div>
                        </div>
                    </>
                );
            default:
                return (
                    <>
                        <div className={styles.osInfo}>
                            <FiMonitor /> Sistema Não Identificado
                        </div>
                        <p className={styles.description}>
                            Vá até as configurações de Bluetooth do seu dispositivo e conecte sua caixa de som ou fone.
                        </p>
                    </>
                );
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <FiBluetooth className={styles.icon} />
                    </div>
                    <div>
                        <h2 className={styles.title}>Conectar Bluetooth</h2>
                        <p className={styles.subtitle}>Sincronize seu áudio</p>
                    </div>
                </div>

                <div className={styles.content}>
                    {renderContent()}
                </div>

                <button className={styles.closeButton} onClick={onClose}>
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default BluetoothModal;
