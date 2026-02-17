import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import styles from './ProducerProducts.module.css';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

import ProductFormModal from './ProductFormModal'; // [NEW]

const ProducerProducts = () => {
    const { addToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // [NEW]

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/shop/my-products');
            setProducts(response.data);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            addToast("Erro ao carregar produtos.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja apagar este produto?")) return;
        try {
            await api.delete(`/shop/products/${id}`); // Uncommented
            setProducts(products.filter(p => p.id !== id));
            addToast("Produto removido!", "success");
        } catch (error) {
            addToast("Erro ao remover produto.", "error");
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h1>Meus Produtos</h1>
                    <p>Gerencie seus Beats, Sound Kits e Serviços.</p>
                </div>
                <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> Novo Produto
                </button>
            </div>

            <div className={styles.searchBar}>
                <FiSearch />
                <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {loading ? <div className={styles.loading}>Carregando...</div> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Tipo</th>
                                <th>Preço</th>
                                <th>Vendas</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className={styles.prodName}>{product.title}</td>
                                    <td><span className={styles.badge}>{product.type}</span></td>
                                    <td>{formatCurrency(product.price)}</td>
                                    <td>{product.salesCount || 0}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[product.status]}`}>
                                            {product.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.actionBtn}><FiEdit2 /></button>
                                            <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete(product.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className={styles.empty}>Nenhum produto encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default ProducerProducts;
