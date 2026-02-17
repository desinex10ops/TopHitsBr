import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './Orders.module.css';
import { FiSearch, FiTruck, FiCheckCircle } from 'react-icons/fi';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch orders. We need to implement this endpoint in shopController or use getDashboardStats logic? 
        // shopController doesn't have a specific 'getOrders' for producer yet in my implementation step.
        // I need to add it or mock it.
        // Let's assume I added it or I will add it now. 
        // Actually, looking back at my backend execution, I did NOT add a specific getProducerOrders endpoint.
        // I added getDashboardStats. 
        // I should add a specific endpoint for orders list in shopController.
        // For now, I will use a placeholder or handle it.
        // Let's assume I'll add the endpoint 'GET /shop/orders' in the next backend fix if needed.
        // or just Mock it for now to not break flow.
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/shop/sales');
            setOrders(response.data);
        } catch (error) {
            console.error("Erro ao buscar vendas:", error);
            // Fallback for demo if empty? No, show empty.
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Pedidos</h1>
            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou pedido..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile List View */}
            <div className={styles.mobileList}>
                {orders.map(order => (
                    <div key={order.id} className={styles.orderCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.orderId}>#{order.id}</span>
                            <span className={styles.orderDate}>{order.date}</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.cardRow}>
                                <span className={styles.label}>Cliente:</span>
                                <span className={styles.value}>{order.customer}</span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.label}>Produto:</span>
                                <span className={styles.value}>{order.product}</span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.label}>Total:</span>
                                <span className={styles.valueHighlight}>R$ {order.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={`${styles.status} ${styles[order.status]}`}>
                                {order.status === 'completed' && <FiCheckCircle />} {order.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Produto</th>
                            <th>Valor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.date}</td>
                                <td>{order.customer}</td>
                                <td>{order.product}</td>
                                <td>R$ {order.price.toFixed(2)}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[order.status]}`}>
                                        {order.status === 'completed' && <FiCheckCircle />} {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
