import * as React from 'react';
import { useCallback } from 'react';
import ToastContainer from '../components/Toast/ToastContainer';

if (!window.__TOAST_INSTANCES__) window.__TOAST_INSTANCES__ = [];
console.log("!!! ToastContext.jsx module LOADED !!! Instance count:", window.__TOAST_INSTANCES__.length + 1);

const ToastContext = React.createContext();
window.__TOAST_INSTANCES__.push(ToastContext);

export const ToastProvider = ({ children }) => {

    const [toast, setToast] = React.useState(null);



    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, addToast: showToast }}>
            {children}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    background: toast.type === 'error' ? '#e74c3c' : 'var(--dynamic-accent)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 1000,
                    animation: 'fadeIn 0.3s'
                }}>
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => React.useContext(ToastContext);
