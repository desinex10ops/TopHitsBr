import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './AdminPiracyLogs.module.css';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const AdminPiracyLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/shop/admin/delivery/logs?page=${page}`);
            const { count, rows } = res.data;
            setLogs(rows);
            setTotalPages(Math.ceil(count / 50));
        } catch (error) {
            console.error("Erro ao buscar logs:", error);
            // alert('Erro ao carregar logs.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <FiCheckCircle color="green" />;
            case 'blocked': return <FiXCircle color="red" />;
            case 'expired': return <FiAlertTriangle color="orange" />;
            default: return <FiAlertTriangle color="gray" />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Monitoramento Anti-Pirataria</h1>
                <button onClick={fetchLogs} className={styles.refreshBtn}><FiRefreshCw /> Atualizar</button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Status</th>
                            <th>Usuário</th>
                            <th>Produto</th>
                            <th>IP</th>
                            <th>Motivo/Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className={styles.loading}>Carregando...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="6" className={styles.empty}>Nenhum registro encontrado.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className={styles.statusCol}>
                                        {getStatusIcon(log.status)}
                                        <span className={styles[log.status]}>{log.status.toUpperCase()}</span>
                                    </td>
                                    <td>
                                        {log.User ? (
                                            <div>
                                                <div className={styles.userName}>{log.User.name}</div>
                                                <div className={styles.userEmail}>{log.User.email}</div>
                                            </div>
                                        ) : 'Visitante'}
                                    </td>
                                    <td>
                                        {log.DownloadLink && log.DownloadLink.Product ? log.DownloadLink.Product.title : 'Link Removido'}
                                    </td>
                                    <td>{log.ipAddress}</td>
                                    <td>{log.reason || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima</button>
            </div>
        </div>
    );
};

export default AdminPiracyLogs;
