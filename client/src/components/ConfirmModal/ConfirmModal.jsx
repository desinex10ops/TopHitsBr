import * as React from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button onClick={onCancel} className={styles.cancelBtn}>Cancelar</button>
                    <button onClick={onConfirm} className={styles.confirmBtn}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
