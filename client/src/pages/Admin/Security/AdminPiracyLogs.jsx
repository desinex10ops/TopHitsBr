import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './AdminPiracyLogs.module.css';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiRefreshCw, FiInfo } from 'react-icons/fi';

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
            // deliveryController returns { count, rows }
            const { count, rows } = res.data;
            setLogs(rows);
            setTotalPages(Math.ceil(count / 50) || 1);
        } catch (error) {
            console.error("Erro ao buscar logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <FiCheckCircle className={styles.success} />;
            case 'blocked': return <FiXCircle className={styles.blocked} />;
            case 'expired': return <FiAlertTriangle className={styles.expired} />;
            default: return <FiInfo className={styles.failed} />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Logs de Segurança Anti-Pirataria</h2>
                <button onClick={fetchLogs} className={styles.refreshBtn} disabled={loading}>
                    <FiRefreshCw className={loading ? styles.spinning : ''} />
                    {loading ? 'Sincronizando...' : 'Atualizar'}
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Data / Hora</th>
                            <th>Status</th>
                            <th>Usuário / Comprador</th>
                            <th>Item Comprado</th>
                            <th>IP / Dispositivo</th>
                            <th>Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && logs.length === 0 ? (
                            <tr><td colSpan="6" className={styles.loading}>Carregando registros de segurança...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="6" className={styles.empty}>Nenhuma atividade suspeita registrada.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td>
                                        <div className={styles.statusCol}>
                                            {getStatusIcon(log.status)}
                                            <span className={styles[log.status] || ''}>{log.status.toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {log.User ? (
                                            <div>
                                                <div className={styles.userName}>{log.User.name}</div>
                                                <div className={styles.userEmail}>{log.User.email}</div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#888' }}>Visitante Anônimo</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.productTitle}>
                                            {log.DownloadLink?.Product?.title || 'Produto Removido'}
                                        </div>
                                        {log.DownloadLink && (
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>ID Pedido: #{log.DownloadLink.OrderId}</div>
                                        )}
                                    </td>
                                    <td>
                                        <div>{log.ipAddress}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#555', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {log.userAgent}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>{log.reason || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
                    <span>Página {page} de {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima</button>
                </div>
            )}
        </div>
    );
};

export default AdminPiracyLogs;
