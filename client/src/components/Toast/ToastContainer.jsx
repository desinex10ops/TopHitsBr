import React from 'react';
import styles from './Toast.module.css';

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${styles[toast.type]}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <div className={styles.icon}>
                        {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
                    </div>
                    <div className={styles.message}>{toast.message}</div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
