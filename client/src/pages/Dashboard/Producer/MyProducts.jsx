import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './MyProducts.module.css';
import { FiPlus, FiTrash2, FiEdit2, FiEye } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import NewProductModal from './NewProductModal';
import { getStorageUrl } from '../../../utils/urlUtils';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/shop/my-products');
            setProducts(response.data);
        } catch (error) {
            console.error(error);
            addToast('Erro ao carregar produtos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            await api.delete(`/shop/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
            addToast('Produto excluído.', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao excluir produto.', 'error');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Meus Produtos</h1>
                <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> Novo Produto
                </button>
            </div>

            {loading ? (
                <div>Carregando...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    {products.length === 0 ? (
                        <div className={styles.empty}>Você ainda não tem produtos à venda.</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Capa</th>
                                    <th>Título</th>
                                    <th>Tipo</th>
                                    <th>Preço</th>
                                    <th>Vendas</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <img
                                                src={product.coverPath ? getStorageUrl(product.coverPath) : '/default_cover.jpg'}
                                                alt=""
                                                className={styles.coverThumb}
                                            />
                                        </td>
                                        <td>{product.title}</td>
                                        <td><span className={styles.badge}>{product.type}</span></td>
                                        <td>R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}</td>
                                        <td>{product.salesCount}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[product.status]}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className={styles.actions}>
                                            <button className={styles.actionBtn} title="Editar"><FiEdit2 /></button>
                                            <button className={styles.actionBtn} onClick={() => handleDelete(product.id)} title="Excluir"><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {isModalOpen && (
                <NewProductModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchMyProducts();
                    }}
                />
            )}
        </div>
    );
};

export default MyProducts;
