import React, { useState } from 'react';
import styles from './PremiumShop.module.css';
import {
    FiTrendingUp, FiShield, FiCpu, FiMonitor, FiSearch, FiX, FiPlus, FiSmile, FiClock, FiZap, FiGift, FiPackage, FiStar, FiShoppingCart
} from 'react-icons/fi';
import { FaDog, FaCat, FaDragon, FaCrow, FaGhost } from 'react-icons/fa';
import ChromaPet from './ChromaPet';

const PremiumShop = ({ onClose, currentEffect, onEquip, currentFrame, onEquipFrame, currentPet, onEquipPet, currentUserRank }) => {
    const [activeSection, setActiveSection] = useState('highlights');
    const [coins, setCoins] = useState(105400);
    const [previewEffect, setPreviewEffect] = useState('neon');
    const [previewFrame, setPreviewFrame] = useState('none');
    const [ownedEffects, setOwnedEffects] = useState(['neon', 'fire', 'electric']);
    const [ownedFrames, setOwnedFrames] = useState(['none']);
    const [ownedPets, setOwnedPets] = useState(['fox_3d']);
    const [previewPet, setPreviewPet] = useState(null);

    // ADM UPLOAD STATE
    const [newPetName, setNewPetName] = useState('');
    const [newPetPrice, setNewPetPrice] = useState(5000);
    const [newPetVideo, setNewPetVideo] = useState(null); // URL (Blob)
    const [newPetType, setNewPetType] = useState('video'); // 'video' | 'image'
    const [newPetTolerance, setNewPetTolerance] = useState(100);
    const [newPetSmoothing, setNewPetSmoothing] = useState(0.1);

    // Load custom pets from local storage
    const [customPets, setCustomPets] = useState(() => {
        const saved = localStorage.getItem('topHits_customPets');
        return saved ? JSON.parse(saved) : [];
    });

    // ... menuItems ...

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setNewPetVideo(url);

            if (file.type.startsWith('image/')) {
                setNewPetType('image');
            } else {
                setNewPetType('video');
            }
        }
    };

    const menuItems = [
        { id: 'highlights', label: 'Destaques', icon: <FiClock /> },
        { id: 'pets', label: 'Pets Premium 3D', icon: <FaDog /> },
        { id: 'effects', label: 'Efeitos de Nick', icon: <FiZap /> },
        { id: 'frames', label: 'Molduras Premium', icon: <FiMonitor /> },
        { id: 'gifts', label: 'Presentes Animados', icon: <FiGift /> },
        { id: 'vip', label: 'Clube VIP', icon: <FiShield /> },
        { id: 'packs', label: 'Packs & Combos', icon: <FiPackage /> },
        { id: 'inventory', label: 'Meu Inventário', icon: <FiCpu /> },
        { id: 'coins', label: 'Moedas Virtuais', icon: <FiStar /> },
        { id: 'rankings', label: 'Rankings', icon: <FiTrendingUp /> },
    ];

    // --- PETS SYSTEM DATA (100 Pets) ---
    const petRarities = {
        common: { color: '#b0c3d9', price: 2000, label: 'COMUM' },
        rare: { color: '#0070dd', price: 5000, label: 'RARO' },
        epic: { color: '#a335ee', price: 12000, label: 'ÉPICO' },
        legendary: { color: '#ff8000', price: 25000, label: 'LENDÁRIO' }
    };

    const generatePets = () => {
        const pets = [];
        const types = [
            { id: 1, name: 'Raposinha', icon: <FaDog />, rarity: 'common' },
            { id: 2, name: 'Gatinho', icon: <FaCat />, rarity: 'common' },
            { id: 3, name: 'Cachorrinho', icon: <FaDog />, rarity: 'common' },
            { id: 4, name: 'Panda', icon: <FaDog />, rarity: 'common' },
            { id: 5, name: 'Coelhinho', icon: <FaDog />, rarity: 'common' },
            { id: 6, name: 'Ursinho', icon: <FaDog />, rarity: 'common' },
            { id: 7, name: 'Hamster', icon: <FaDog />, rarity: 'common' },
            { id: 8, name: 'Passarinho', icon: <FaCrow />, rarity: 'common' },
            { id: 9, name: 'Pinguim', icon: <FaCrow />, rarity: 'common' },
            { id: 10, name: 'Porquinho', icon: <FaDog />, rarity: 'common' },

            { id: 11, name: 'Raposa Neon', icon: <FaDog />, rarity: 'rare' },
            { id: 12, name: 'Gato Cyber', icon: <FaCat />, rarity: 'rare' },
            { id: 13, name: 'Cachorro Robô', icon: <FaDog />, rarity: 'rare' },
            { id: 14, name: 'Panda Gamer', icon: <FaDog />, rarity: 'rare' },
            { id: 15, name: 'Coelho Mágico', icon: <FaDog />, rarity: 'rare' },
            { id: 16, name: 'Lobo Urbano', icon: <FaDog />, rarity: 'rare' },
            { id: 17, name: 'Coruja Sábia', icon: <FaCrow />, rarity: 'rare' },
            { id: 18, name: 'Dragão Baby', icon: <FaDragon />, rarity: 'rare' },
            { id: 19, name: 'Tigre Bebê', icon: <FaCat />, rarity: 'rare' },
            { id: 20, name: 'Unicórnio Baby', icon: <FaDog />, rarity: 'rare' },

            { id: 21, name: 'Dragão de Fogo', icon: <FaDragon />, rarity: 'epic' },
            { id: 22, name: 'Dragão de Gelo', icon: <FaDragon />, rarity: 'epic' },
            { id: 23, name: 'Fênix Baby', icon: <FaCrow />, rarity: 'epic' },
            { id: 24, name: 'Kitsune Mística', icon: <FaDog />, rarity: 'epic' },
            { id: 25, name: 'Tigre Elétrico', icon: <FaCat />, rarity: 'epic' },
            { id: 26, name: 'Lobo Espectral', icon: <FaDog />, rarity: 'epic' },
            { id: 27, name: 'Leão Dourado', icon: <FaCat />, rarity: 'epic' },
            { id: 28, name: 'Panda Samurai', icon: <FaDog />, rarity: 'epic' },
            { id: 29, name: 'Corvo Arcano', icon: <FaCrow />, rarity: 'epic' },
            { id: 30, name: 'Serpente Cósmica', icon: <FaDragon />, rarity: 'epic' },

            { id: 31, name: 'Dragão Celestial', icon: <FaDragon />, rarity: 'legendary' },
            { id: 32, name: 'Raposa Espiritual', icon: <FaDog />, rarity: 'legendary' },
            { id: 33, name: 'Guardião Cósmico', icon: <FaGhost />, rarity: 'legendary' },
            { id: 34, name: 'Fênix Divina', icon: <FaCrow />, rarity: 'legendary' },
            { id: 35, name: 'Lobo Astral', icon: <FaDog />, rarity: 'legendary' },
            { id: 36, name: 'Tigre Cósmico', icon: <FaCat />, rarity: 'legendary' },
            { id: 37, name: 'Unicórnio Rainbow', icon: <FaDog />, rarity: 'legendary' },
            { id: 38, name: 'Serafim Guardião', icon: <FaGhost />, rarity: 'legendary' },
            { id: 39, name: 'Dragão Arcano', icon: <FaDragon />, rarity: 'legendary' },
            { id: 40, name: 'Avatar da Luz', icon: <FaGhost />, rarity: 'legendary' }
        ];

        // Generate variants 41-100
        const modifiers = ['Elemental', 'Futurista', 'Anime', 'Cyberpunk', 'Neon', 'Mágico', 'Cósmico', 'Sombrio', 'Divino', 'Infernal'];
        let idCounter = 41;

        modifiers.forEach(mod => {
            types.slice(0, 6).forEach(base => {
                pets.push({
                    id: idCounter++,
                    name: `${base.name} ${mod}`,
                    icon: base.icon,
                    rarity: idCounter % 5 === 0 ? 'legendary' : (idCounter % 3 === 0 ? 'epic' : 'rare')
                });
            });
        });

        return [...types, ...pets].map(p => ({
            ...p,
            price: petRarities[p.rarity].price,
            img: `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.name}&backgroundColor=transparent` // Placeholder visual
        }));
    };

    const [petsList, setPetsList] = useState(() => {
        const generated = generatePets();
        const saved = localStorage.getItem('topHits_customPets');
        const custom = saved ? JSON.parse(saved) : [];
        return [...custom, ...generated];
    });



    const handlePublishPet = () => {
        if (!newPetName || !newPetVideo) {
            alert("Preencha nome e selecione um vídeo!");
            return;
        }

        const newPet = {
            id: Date.now(), // Unique ID
            name: newPetName,
            price: parseInt(newPetPrice),
            rarity: 'epic', // Default for custom
            type: newPetType,
            url: newPetType === 'video' ? newPetVideo : null,
            img: newPetType === 'image' ? newPetVideo : 'https://cdn-icons-png.flaticon.com/512/3774/3774638.png', // Generic thumb for video, actual img for image
            tolerance: newPetTolerance
        };

        const updatedCustomPets = [newPet, ...customPets];
        setCustomPets(updatedCustomPets);
        localStorage.setItem('topHits_customPets', JSON.stringify(updatedCustomPets));

        setPetsList(prev => [newPet, ...prev]);

        // Auto-own and Equip for Admin
        if (!ownedPets.some(p => p.id === newPet.id)) {
            setOwnedPets(prev => [...prev, newPet]);
        }
        onEquipPet(newPet);

        // Reset form
        setNewPetName('');
        setNewPetVideo(null);
        alert(`Pet "${newPetName}" publicado e EQUIPADO com sucesso!`);
    };

    const nickEffects = [
        { id: 'neon', name: 'Pink Neon Glow', price: 500, description: 'Brilho neon clássico ultra vibrante.' },
        { id: 'fire', name: 'Inferno Fire', price: 1200, description: 'Chamas vivas que consomem sua mensagem.' },
        { id: 'electric', name: 'Electric Zap', price: 800, description: 'Descargas elétricas constantes.' },
        { id: 'rgb', name: 'Cyber Rainbow', price: 1500, description: 'Fluxo infinito de cores RGB.' },
        { id: 'ice', name: 'Ice Crystal', price: 600, description: 'Efeito congelante com partículas de gelo.' },
        { id: 'gold', name: 'Golden Shine', price: 2500, description: 'Ouro maciço com reflexos de luxo.' },
        { id: 'shadow', name: 'Shadow Pulse', price: 1000, description: 'Energia negra pulsante e misteriosa.' },
        { id: 'holo', name: 'Cyber Hologram', price: 1800, description: 'Estilo digital com glitch e scanlines.' },
        { id: 'plasma', name: 'Plasma Aura', price: 2200, description: 'Aura futurista de plasma instável.' },
        { id: 'galaxy', name: 'Galaxy Particles', price: 3000, description: 'Viaje pelas estrelas com seu nick.' },
    ];

    const virtualGifts = [
        { id: 1, name: 'Rosa de Neon', price: 50, icon: '🌹', anim: 'float' },
        { id: 2, name: 'Coração Pulsante', price: 150, icon: '❤️', anim: 'pulse' },
        { id: 3, name: 'Diamante Eterno', price: 1000, icon: '💎', anim: 'spin' },
        { id: 4, name: 'Coroa Imperial', price: 5000, icon: '👑', anim: 'shine' },
        { id: 5, name: 'Foguete Cyber', price: 500, icon: '🚀', anim: 'launch' },
        { id: 6, name: 'Dragão Holográfico', price: 2500, icon: '🐉', anim: 'roaring' },
    ];

    const coinPackages = [
        { id: 1, amount: 500, price: 9.90, bonus: 0 },
        { id: 2, amount: 1200, price: 19.90, bonus: 200 },
        { id: 3, amount: 5000, price: 49.90, bonus: 1500 },
        { id: 4, amount: 12000, price: 99.90, bonus: 4000 },
        { id: 5, amount: 60000, price: 399.90, bonus: 25000 },
    ];

    const promoPacks = [
        {
            id: 1,
            name: 'Iniciante Cyber',
            price: 14.90,
            items: ['5,000 Moedas', 'Efeito Pink Neon', 'Badge Novato'],
            itemIds: { effects: ['neon'], coins: 5000 },
            icon: '📦',
            badge: 'MAIS VENDIDO',
            gradient: 'linear-gradient(135deg, #a109ff 0%, #2575fc 100%)'
        },
        {
            id: 2,
            name: 'Lendário TopHits',
            price: 59.90,
            items: ['25,000 Moedas', 'Efeito Galaxy (Exclusivo)', 'VIP 30 Dias', 'Badge Elite'],
            itemIds: { effects: ['galaxy'], coins: 25000 },
            icon: '💎',
            badge: 'O MELHOR VALOR',
            gradient: 'linear-gradient(135deg, #ffcc00 0%, #ff6600 100%)'
        },
        {
            id: 3,
            name: 'Mestre do Chat',
            price: 29.90,
            items: ['12,000 Moedas', 'Efeito Electric Zap', 'VIP 7 Dias'],
            itemIds: { effects: ['electric'], coins: 12000 },
            icon: '⚡',
            badge: 'OFERTA LIMITADA',
            gradient: 'linear-gradient(135deg, #00ffff 0%, #00ccff 100%)'
        }
    ];

    const frameList = [
        { id: '01', name: 'Sakura Glow', cat: 'Sakura' }, { id: '02', name: 'Sakura Neon', cat: 'Sakura' }, { id: '03', name: 'Cherry Aura', cat: 'Sakura' }, { id: '04', name: 'Bloom Spirit', cat: 'Sakura' }, { id: '05', name: 'Petal Storm', cat: 'Sakura' }, { id: '06', name: 'Pink Dragon Bloom', cat: 'Sakura' }, { id: '07', name: 'Mystic Blossom', cat: 'Sakura' }, { id: '08', name: 'Angel Sakura', cat: 'Sakura' }, { id: '09', name: 'Rose Pulse', cat: 'Sakura' }, { id: '10', name: 'Divine Petal', cat: 'Sakura' },
        { id: '11', name: 'Shadow Ninja', cat: 'Ninja' }, { id: '12', name: 'Katana Spirit', cat: 'Ninja' }, { id: '13', name: 'Cyber Samurai', cat: 'Ninja' }, { id: '14', name: 'Neon Shinobi', cat: 'Ninja' }, { id: '15', name: 'Ghost Ronin', cat: 'Ninja' }, { id: '16', name: 'Thunder Ninja', cat: 'Ninja' }, { id: '17', name: 'Dragon Katana', cat: 'Ninja' }, { id: '18', name: 'Mystic Shinobi', cat: 'Ninja' }, { id: '19', name: 'Blood Samurai', cat: 'Ninja' }, { id: '20', name: 'Storm Ronin', cat: 'Ninja' },
        { id: '21', name: 'Fire Dragon', cat: 'Dragon' }, { id: '22', name: 'Ice Dragon', cat: 'Dragon' }, { id: '23', name: 'Thunder Dragon', cat: 'Dragon' }, { id: '24', name: 'Shadow Dragon', cat: 'Dragon' }, { id: '25', name: 'Demon King', cat: 'Dragon' }, { id: '26', name: 'Oni Spirit', cat: 'Dragon' }, { id: '27', name: 'Hell Dragon', cat: 'Dragon' }, { id: '28', name: 'Void Demon', cat: 'Dragon' }, { id: '29', name: 'Crimson Beast', cat: 'Dragon' }, { id: '30', name: 'Abyss Dragon', cat: 'Dragon' },
        { id: '31', name: 'Chaos Oni', cat: 'Chaos' }, { id: '32', name: 'Dark Phoenix', cat: 'Chaos' }, { id: '33', name: 'Infernal Lord', cat: 'Chaos' }, { id: '34', name: 'Death Serpent', cat: 'Chaos' }, { id: '35', name: 'Cosmic Dragon', cat: 'Chaos' }, { id: '36', name: 'Eternal Demon', cat: 'Chaos' }, { id: '37', name: 'Blood Oni', cat: 'Chaos' }, { id: '38', name: 'Dragon Emperor', cat: 'Chaos' }, { id: '39', name: 'Black Hellspawn', cat: 'Chaos' }, { id: '40', name: 'Mythic Hydra', cat: 'Chaos' },
        { id: '41', name: 'Sharingan Red', cat: 'Eyes' }, { id: '42', name: 'Mangekyou Glow', cat: 'Eyes' }, { id: '43', name: 'Rinnegan Aura', cat: 'Eyes' }, { id: '44', name: 'Eternal Eye', cat: 'Eyes' }, { id: '45', name: 'Divine Vision', cat: 'Eyes' }, { id: '46', name: 'Phantom Eye', cat: 'Eyes' }, { id: '47', name: 'Void Sight', cat: 'Eyes' }, { id: '48', name: 'Cosmic Iris', cat: 'Eyes' }, { id: '49', name: 'Cyber Eye', cat: 'Eyes' }, { id: '50', name: 'Neon Gaze', cat: 'Eyes' },
        { id: '51', name: 'Frost Vision', cat: 'Sight' }, { id: '52', name: 'Thunder Sight', cat: 'Sight' }, { id: '53', name: 'Spirit Gaze', cat: 'Sight' }, { id: '54', name: 'Blood Vision', cat: 'Sight' }, { id: '55', name: 'Mystic Iris', cat: 'Sight' }, { id: '56', name: 'Dark Sight', cat: 'Sight' }, { id: '57', name: 'Solar Eye', cat: 'Sight' }, { id: '58', name: 'Astral Gaze', cat: 'Sight' }, { id: '59', name: 'Supreme Vision', cat: 'Sight' }, { id: '60', name: 'Infinite Eye', cat: 'Sight' },
        { id: '61', name: 'Cosmic Rift', cat: 'Space' }, { id: '62', name: 'Nebula Core', cat: 'Space' }, { id: '63', name: 'Galaxy Aura', cat: 'Space' }, { id: '64', name: 'Astral Ring', cat: 'Space' }, { id: '65', name: 'Star Emperor', cat: 'Space' }, { id: '66', name: 'Void Gate', cat: 'Space' }, { id: '67', name: 'Dimension Lord', cat: 'Space' }, { id: '68', name: 'Dark Matter', cat: 'Space' }, { id: '69', name: 'Supernova Frame', cat: 'Space' }, { id: '70', name: 'Infinity Portal', cat: 'Space' },
        { id: '71', name: 'Space Warp', cat: 'Cosmos' }, { id: '72', name: 'Black Hole', cat: 'Cosmos' }, { id: '73', name: 'Celestial Crown', cat: 'Cosmos' }, { id: '74', name: 'Eternal Cosmos', cat: 'Cosmos' }, { id: '75', name: 'Quantum Core', cat: 'Cosmos' }, { id: '76', name: 'Nova Storm', cat: 'Cosmos' }, { id: '77', name: 'Stellar Crown', cat: 'Cosmos' }, { id: '78', name: 'Nebula Emperor', cat: 'Cosmos' }, { id: '79', name: 'Universal Rift', cat: 'Cosmos' }, { id: '80', name: 'God Dimension', cat: 'Cosmos' },
        { id: '81', name: 'Neon Dragon', cat: 'Beast' }, { id: '82', name: 'Cyber Kitsune', cat: 'Beast' }, { id: '83', name: 'Spirit Wolf', cat: 'Beast' }, { id: '84', name: 'Shadow Fox', cat: 'Beast' }, { id: '85', name: 'Fire Tiger', cat: 'Beast' }, { id: '86', name: 'Thunder Lion', cat: 'Beast' }, { id: '87', name: 'Ice Phoenix', cat: 'Beast' }, { id: '88', name: 'Dark Griffin', cat: 'Beast' }, { id: '89', name: 'Cosmic Serpent', cat: 'Beast' }, { id: '90', name: 'Solar Beast', cat: 'Beast' },
        { id: '91', name: 'Golden Shogun', cat: 'Divine' }, { id: '92', name: 'Imperial Crown', cat: 'Divine' }, { id: '93', name: 'Divine Halo', cat: 'Divine' }, { id: '94', name: 'Eternal Throne', cat: 'Divine' }, { id: '95', name: 'Legendary Aura', cat: 'Divine' }, { id: '96', name: 'Mythic Ring', cat: 'Divine' }, { id: '97', name: 'Supreme Crown', cat: 'Divine' }, { id: '98', name: 'Royal Frame', cat: 'Divine' }, { id: '99', name: 'Ascended Halo', cat: 'Divine' }, { id: '100', name: 'God Emperor', cat: 'Divine' },
    ];

    const nickFrames = frameList.map(f => ({
        ...f,
        price: 1500,
        description: "Moldura premium estilizada tema " + f.cat + "."
    }));

    const topSelling = [
        { id: 'rgb', name: 'Cyber Rainbow', price: 1500, type: 'Efeito', icon: <FiZap /> },
        { id: '92', name: 'Imperial Crown', price: 1500, type: 'Moldura', icon: <FiMonitor /> },
        { id: '3', name: 'Diamante Eterno', price: 1000, type: 'Presente', icon: <FiGift /> },
        { id: 'galaxy', name: 'Galaxy Particles', price: 3000, type: 'Efeito', icon: <FiZap /> },
    ];

    const newCollections = [
        { id: '41', name: 'Sharingan Red', price: 1500, type: 'Moldura', icon: <FiMonitor />, isNew: true },
        { id: '42', name: 'Mangekyou Glow', price: 1500, type: 'Moldura', icon: <FiMonitor />, isNew: true },
        { id: 'gold', name: 'Golden Shine', price: 2500, type: 'Efeito', icon: <FiZap />, isNew: true },
        { id: '4', name: 'Coroa Imperial', price: 5000, type: 'Presente', icon: <FiGift />, isNew: true },
    ];

    const handlePurchaseEffect = (effect) => {
        if (ownedEffects.includes(effect.id)) {
            alert("Você já possui o efeito " + effect.name + "!");
            return;
        }

        if (coins >= effect.price) {
            setCoins(coins - effect.price);
            setOwnedEffects([...ownedEffects, effect.id]);
            alert("Sucesso! O efeito " + effect.name + " foi adicionado ao seu inventário.");
        } else {
            alert("Saldo insuficiente! Recarregue suas moedas para adquirir este efeito.");
        }
    };

    const handlePurchaseFrame = (frame) => {
        if (ownedFrames.includes(frame.id)) {
            alert("Você já possui a moldura " + frame.name + "!");
            return;
        }

        if (coins >= frame.price) {
            setCoins(coins - frame.price);
            setOwnedFrames([...ownedFrames, frame.id]);
            alert("Sucesso! A moldura " + frame.name + " foi adicionado ao seu inventário.");
        } else {
            alert("Saldo insuficiente! Recarregue suas moedas para adquirir esta moldura.");
        }
    };

    const handlePurchasePack = (pack) => {
        if (pack.itemIds?.effects) {
            setOwnedEffects(prev => [...new Set([...prev, ...pack.itemIds.effects])]);
        }
        if (pack.itemIds?.coins) {
            setCoins(prev => prev + pack.itemIds.coins);
        }
        alert("Parabéns! Você adquiriu o " + pack.name + " e os itens foram adicionados à sua conta.");
    };

    const handleBuyCoins = (pkg) => {
        setCoins(prev => prev + pkg.amount + pkg.bonus);
        alert("Recarga realizada com sucesso! " + (pkg.amount + pkg.bonus).toLocaleString() + " moedas adicionadas.");
    };

    const handlePurchasePet = (pet) => {
        if (ownedPets.some(p => p.id === pet.id)) {
            alert("Você já possui o pet " + pet.name + "!");
            return;
        }

        if (coins >= pet.price) {
            setCoins(coins - pet.price);
            setOwnedPets(prev => [...prev, pet]);
            alert("Sucesso! O pet " + pet.name + " agora é seu companheiro!");
        } else {
            alert("Saldo insuficiente para adotar este pet.");
        }
    };

    const getNickStyle = (effect) => {
        return styles.previewNick + " " + styles["nickEffect_" + (effect || "neon")];
    };

    const renderPreviewNick = (effect, frame) => {
        const nickClass = getNickStyle(effect);
        if (!frame || frame === 'none') return <h2 className={nickClass}>Marcelo_Premium</h2>;
        return (
            <div className={styles.framePreview + " " + styles["frame_" + frame]}>
                <h2 className={nickClass}>Marcelo_Premium</h2>
            </div>
        );
    };

    return (
        <div className={styles.shopOverlay}>
            <div className={styles.shopContainer}>
                <button className={styles.closeShop} onClick={onClose}><FiX /></button>

                {/* 1. SIDEBAR NAVIGATION */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.shopLogo}>
                            <FiShoppingCart className={styles.logoIcon} />
                            <span>Premium SHOP</span>
                        </div>
                    </div>

                    <nav className={styles.navMenu}>
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={styles.navItem + " " + (activeSection === item.id ? styles.navActive : "")}
                                onClick={() => setActiveSection(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {activeSection === item.id && <div className={styles.activeIndicator} />}
                            </button>
                        ))}
                    </nav>

                    <div className={styles.userBalance}>
                        <div className={styles.balanceInfo}>
                            <span className={styles.label}>SEU SALDO</span>
                            <div className={styles.coinsDisplay}>
                                <FiStar className={styles.coinIcon} />
                                <span>{coins.toLocaleString()}</span>
                            </div>
                        </div>
                        <button className={styles.addCoinsBtn} onClick={() => setActiveSection('coins')}>RECARREGAR</button>
                    </div>
                </aside>

                {/* 2. MAIN CONTENT AREA */}
                <main className={styles.mainContent}>
                    <header className={styles.sectionHeader}>
                        <div className={styles.headerTitle}>
                            <h1>{menuItems.find(i => i.id === activeSection)?.label}</h1>
                            <p>As melhores ofertas do TopHitsBr encontradas para você</p>
                        </div>
                        <div className={styles.headerActions}>
                            <div className={styles.searchBar}>
                                <FiSearch />
                                <input type="text" placeholder="Buscar por nome..." />
                            </div>
                        </div>
                    </header>

                    <div className={styles.contentScroll}>
                        {activeSection === 'highlights' && (
                            <div className={styles.highlightsArea}>
                                <div className={styles.promoBanner}>
                                    <div className={styles.bannerContent}>
                                        <span className={styles.badge}>OFERTA DO DIA</span>
                                        <h2>Pack Lendário Cyber</h2>
                                        <p>Efeito Galaxy + 10,000 Moedas + Badge VIP</p>
                                        <div className={styles.bannerActions}>
                                            <button className={styles.buyNowBtn} onClick={() => handlePurchasePack({ name: 'Pack Lendário Cyber', itemIds: { effects: ['galaxy'], coins: 10000 } })}>RESGATAR AGORA</button>
                                            <div className={styles.timer}>
                                                <span>Acaba em: 08h 12m 45s</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.bannerImage}>
                                        <div className={styles.holoShield}><FiShield /></div>
                                    </div>
                                </div>

                                <div className={styles.highlightsSection}>
                                    <h3><FiStar /> Mais Vendidos</h3>
                                    <div className={styles.highlightsGrid}>
                                        {topSelling.map(item => (
                                            <div key={item.id} className={styles.miniCard}>
                                                <div className={styles.miniIcon}>{item.icon}</div>
                                                <div className={styles.miniContent}>
                                                    <h4>{item.name}</h4>
                                                    <p>{item.type} Premium</p>
                                                </div>
                                                <div className={styles.miniFooter}>
                                                    <div className={styles.miniPrice}><FiStar /> {item.price.toLocaleString()}</div>
                                                    <button className={styles.miniBuyBtn} onClick={() => {
                                                        if (item.type === 'Efeito') handlePurchaseEffect(item);
                                                        else if (item.type === 'Moldura') handlePurchaseFrame(item);
                                                        else alert("Item " + item.name + " adicionado!");
                                                    }}>
                                                        <FiPlus />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.highlightsSection}>
                                    <h3><FiMonitor /> Novas Coleções</h3>
                                    <div className={styles.highlightsGrid}>
                                        {newCollections.map(item => (
                                            <div key={item.id} className={styles.miniCard}>
                                                {item.isNew && <span className={styles.newBadge}>NOVO</span>}
                                                <div className={styles.miniIcon}>{item.icon}</div>
                                                <div className={styles.miniContent}>
                                                    <h4>{item.name}</h4>
                                                    <p>{item.type} de Elite</p>
                                                </div>
                                                <div className={styles.miniFooter}>
                                                    <div className={styles.miniPrice}><FiStar /> {item.price.toLocaleString()}</div>
                                                    <button className={styles.miniBuyBtn} onClick={() => {
                                                        if (item.type === 'Efeito') handlePurchaseEffect(item);
                                                        else if (item.type === 'Moldura') handlePurchaseFrame(item);
                                                        else alert("Novo item " + item.name + " adquirido com sucesso!");
                                                    }}>
                                                        <FiPlus />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'pets' && (
                            <div className={styles.effectsArea}>
                                <div className={styles.livePreviewBar}>
                                    <div className={styles.previewInfo}>
                                        <span className={styles.preTitle}>PREVIEW DO PET:</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {previewPet && <img src={previewPet.img} alt={previewPet.name} style={{ width: '50px', height: '50px' }} className={styles.petBounce} />}
                                            <h2 className={getNickStyle(currentEffect)}>Marcelo_Premium</h2>
                                        </div>
                                    </div>
                                    <div className={styles.previewMeta}>
                                        {previewPet ? (
                                            <>
                                                <span>Pet: <strong style={{ color: previewPet.type === 'video' ? '#00ffcc' : petRarities[previewPet.rarity].color }}>{previewPet.name}</strong></span>
                                                <button className={styles.buyMainBtn} onClick={() => handlePurchasePet(previewPet)}>
                                                    ADOTAR POR {previewPet.price.toLocaleString()} MOEDAS
                                                </button>
                                            </>
                                        ) : <span>Selecione um pet para visualizar</span>}
                                    </div>
                                </div>

                                {/* ADMIN UPLOAD SECTION */}
                                {currentUserRank === 'Admin' && (
                                    <div className={styles.adminUploadSection} style={{ background: 'rgba(255, 0, 0, 0.15)', padding: '20px', borderRadius: '12px', border: '1px solid #ff4444', marginBottom: '20px' }}>
                                        <h3 style={{ color: '#ff4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FiShield /> PAINEL ADMIN: NOVO PET
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginTop: '15px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Nome do Pet"
                                                    value={newPetName}
                                                    onChange={e => setNewPetName(e.target.value)}
                                                    className={styles.adminInput}
                                                    style={{ background: '#222', border: '1px solid #444', padding: '10px', color: '#fff', borderRadius: '8px' }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Preço (Moedas)"
                                                    value={newPetPrice}
                                                    onChange={e => setNewPetPrice(e.target.value)}
                                                    className={styles.adminInput}
                                                    style={{ background: '#222', border: '1px solid #444', padding: '10px', color: '#fff', borderRadius: '8px' }}
                                                />
                                                <input
                                                    type="file"
                                                    accept="video/*,image/*"
                                                    onChange={handleFileChange}
                                                    style={{ color: '#fff' }}
                                                />

                                                {newPetVideo && (
                                                    <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                                                        <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Tolerância de Verde: {newPetTolerance}</label>
                                                        <input
                                                            type="range" min="0" max="255"
                                                            value={newPetTolerance}
                                                            onChange={(e) => setNewPetTolerance(Number(e.target.value))}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={handlePublishPet}
                                                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                                                >
                                                    PUBLICAR PET NA LOJA
                                                </button>
                                            </div>

                                            <div style={{ background: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', border: '2px dashed #444', overflow: 'hidden' }}>
                                                {newPetVideo ? (
                                                    newPetType === 'video' ? (
                                                        <ChromaPet videoUrl={newPetVideo} width={200} height={200} tolerance={newPetTolerance} smoothing={newPetSmoothing} />
                                                    ) : (
                                                        <img src={newPetVideo} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                    )
                                                ) : <span style={{ color: '#666' }}>Preview do Arquivo</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.itemsGrid}>
                                    {petsList.map(pet => (
                                        <div
                                            key={pet.id}
                                            className={styles.itemCard + " " + (previewPet?.id === pet.id ? styles.itemActive : "")}
                                            onClick={() => setPreviewPet(pet)}
                                            style={{ borderColor: pet.rarity ? petRarities[pet.rarity].color : '#00ffcc' }}
                                        >
                                            <div className={styles.cardHeader}>
                                                <h3 style={{ color: pet.rarity ? petRarities[pet.rarity].color : '#00ffcc' }}>{pet.name}</h3>
                                                <div className={styles.priceTag}>
                                                    <FiStar /> {pet.price.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={styles.petPreviewContainer} style={{ minHeight: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {pet.type === 'video' ? (
                                                    <div className={styles.petIconLarge} style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
                                                        <ChromaPet videoUrl={pet.url} width={100} height={100} tolerance={pet.tolerance || 100} />
                                                    </div>
                                                ) : (
                                                    <img src={pet.img} alt={pet.name} className={styles.petIconLarge} />
                                                )}
                                                <span className={styles.rarityBadge} style={{ background: pet.rarity ? petRarities[pet.rarity].color : '#00ffcc' }}>
                                                    {pet.rarity ? petRarities[pet.rarity].label : 'CUSTOM'}
                                                </span>
                                            </div>
                                            <div className={styles.cardActions}>
                                                <button className={styles.testBtn}>VER</button>
                                                {ownedPets.some(p => p.id === pet.id) ? (
                                                    <button className={styles.buyBtn} style={{ background: '#4CAF50' }} onClick={(e) => { e.stopPropagation(); onEquipPet(pet); alert(`Pet ${pet.name} equipado!`); }}>EQUIPAR</button>
                                                ) : (
                                                    <button className={styles.buyBtn} onClick={(e) => { e.stopPropagation(); handlePurchasePet(pet); }}>ADOTAR</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'effects' && (
                            <div className={styles.effectsArea}>
                                <div className={styles.livePreviewBar}>
                                    <div className={styles.previewInfo}>
                                        <span className={styles.preTitle}>PREVIEW EM TEMPO REAL:</span>
                                        <h2 className={getNickStyle(previewEffect)}>Marcelo_Premium</h2>
                                    </div>
                                    <div className={styles.previewMeta}>
                                        <span>Efeito atual: <strong>{nickEffects.find(e => e.id === previewEffect)?.name}</strong></span>
                                        <button
                                            className={styles.buyMainBtn}
                                            onClick={() => handlePurchaseEffect(nickEffects.find(e => e.id === previewEffect))}
                                        >
                                            COMPRAR POR {nickEffects.find(e => e.id === previewEffect)?.price} MOEDAS
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.itemsGrid}>
                                    {nickEffects.map(effect => (
                                        <div
                                            key={effect.id}
                                            className={styles.itemCard + " " + (previewEffect === effect.id ? styles.itemActive : "")}
                                            onClick={() => setPreviewEffect(effect.id)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <h3 className={getNickStyle(effect.id)}>{effect.name}</h3>
                                                <div className={styles.priceTag}>
                                                    <FiStar /> {effect.price.toLocaleString()}
                                                </div>
                                            </div>
                                            <p className={styles.itemDesc}>{effect.description}</p>
                                            <div className={styles.cardActions}>
                                                <button className={styles.testBtn}>DEMO</button>
                                                <button className={styles.buyBtn} onClick={(e) => { e.stopPropagation(); handlePurchaseEffect(effect); }}>COMPRAR</button>
                                            </div>
                                            {previewEffect === effect.id && <div className={styles.cardGlow} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'frames' && (
                            <div className={styles.effectsArea}>
                                <div className={styles.livePreviewBar}>
                                    <div className={styles.previewInfo}>
                                        <span className={styles.preTitle}>PREVIEW DA MOLDURA:</span>
                                        {renderPreviewNick(previewEffect, previewFrame)}
                                    </div>
                                    <div className={styles.previewMeta}>
                                        <span>Moldura: <strong>{previewFrame === 'none' ? 'Nenhuma' : nickFrames.find(f => f.id === previewFrame)?.name}</strong></span>
                                        <button
                                            className={styles.buyMainBtn}
                                            onClick={() => previewFrame !== 'none' && handlePurchaseFrame(nickFrames.find(f => f.id === previewFrame))}
                                        >
                                            COMPRAR POR 1.500 MOEDAS
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.itemsGrid}>
                                    {nickFrames.map(frame => (
                                        <div
                                            key={frame.id}
                                            className={styles.itemCard + " " + (previewFrame === frame.id ? styles.itemActive : "")}
                                            onClick={() => setPreviewFrame(frame.id)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <h3># {frame.id} {frame.name}</h3>
                                                <div className={styles.priceTag}>
                                                    <FiStar /> {frame.price.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={styles.frameThumb}>
                                                <div className={styles.framePreviewSmall + " " + styles["frame_" + frame.id]}>
                                                    <span>NICK</span>
                                                </div>
                                            </div>
                                            <div className={styles.cardActions}>
                                                <button className={styles.testBtn}>PREVIEW</button>
                                                <button className={styles.buyBtn} onClick={(e) => { e.stopPropagation(); handlePurchaseFrame(frame); }}>COMPRAR</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeSection === 'gifts' && (
                            <div className={styles.giftsArea}>
                                <div className={styles.promoLabel}>PRESENTES MAIS ENVIADOS DO MÊS 🔥</div>
                                <div className={styles.giftsGrid}>
                                    {virtualGifts.map(gift => (
                                        <div key={gift.id} className={styles.giftCard}>
                                            <div className={styles.giftIcon + " " + styles[gift.anim]}>{gift.icon}</div>
                                            <h4>{gift.name}</h4>
                                            <div className={styles.giftPrice}><FiStar /> {gift.price}</div>
                                            <button className={styles.giftBuyBtn}>ENVIAR AGORA</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'vip' && (
                            <div className={styles.vipArea}>
                                <div className={styles.vipHero}>
                                    <FiShield className={styles.vipBigIcon} />
                                    <h2>SEJA UM MEMBRO ELITE 👑</h2>
                                    <p>Ganhe status, poder e benefícios exclusivos no TopHitsBr.</p>
                                </div>
                                <div className={styles.vipPlans}>
                                    <div className={styles.vipCard}>
                                        <div className={styles.planHeader}>
                                            <h3>VIP MENSAL</h3>
                                            <div className={styles.planPrice}>R$ 19,90<span>/mês</span></div>
                                        </div>
                                        <ul className={styles.vipBenefits}>
                                            <li><FiStar /> Nick Dourado Exclusivo</li>
                                            <li><FiZap /> Multiplicador XP 2x</li>
                                            <li><FiGift /> 1,500 Moedas Bonus</li>
                                            <li><FiMonitor /> Badge VIP no Perfil</li>
                                        </ul>
                                        <button className={styles.buyVipBtn}>ASSINAR AGORA</button>
                                    </div>
                                    <div className={styles.vipCard + " " + styles.vipRecommended + " " + styles.shineEffect}>
                                        <div className={styles.recommendedBadge}>MELHOR ESCOLHA</div>
                                        <div className={styles.planHeader}>
                                            <h3>VIP ANUAL</h3>
                                            <div className={styles.planPrice}>R$ 149,90<span>/ano</span></div>
                                            <div className={styles.savings}>ECONOMIZE R$ 88,00</div>
                                        </div>
                                        <ul className={styles.vipBenefits}>
                                            <li><FiStar /> Todas as vantagens mensal</li>
                                            <li><FiPackage /> 20,000 Moedas Imediatas</li>
                                            <li><FiTrendingUp /> Suporte Prioritário</li>
                                            <li><FiStar /> Efeito "Diamond Shine"</li>
                                        </ul>
                                        <button className={styles.buyVipBtn} onClick={() => alert('Plano VIP Anual selecionado! Redirecionando para o pagamento...')}>ASSINAR AGORA</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'packs' && (
                            <div className={styles.packsArea}>
                                <div className={styles.promoHeader}>
                                    <h2>COMBOS DE ELITE 🚀</h2>
                                    <p>Economize até 50% levando itens em conjunto!</p>
                                </div>
                                <div className={styles.packsGrid}>
                                    {promoPacks.map(pack => (
                                        <div
                                            key={pack.id}
                                            className={styles.packCard + " " + (pack.id === 2 ? styles.shineEffect : "")}
                                            style={{ '--accent': pack.gradient }}
                                        >
                                            <div className={styles.packBadge}>{pack.badge}</div>
                                            <div className={styles.packIcon}>{pack.icon}</div>
                                            <h3>{pack.name}</h3>
                                            <ul className={pack.items.length > 3 ? (styles.packItems + " " + styles.compactItems) : styles.packItems}>
                                                {pack.items.map((item, idx) => (
                                                    <li key={idx}><FiStar className={styles.starIcon} /> {item}</li>
                                                ))}
                                            </ul>
                                            <div className={styles.packFooter}>
                                                <div className={styles.packPrice}>R$ {pack.price.toFixed(2)}</div>
                                                <button
                                                    className={styles.buyPackBtn}
                                                    onClick={() => handlePurchasePack(pack)}
                                                >
                                                    RESGATAR COMBO
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'coins' && (
                            <div className={styles.coinsArea}>
                                <div className={styles.coinsGrid}>
                                    {coinPackages.map(pkg => (
                                        <div key={pkg.id} className={styles.coinCard}>
                                            {pkg.bonus > 0 && <div className={styles.bonusBadge}>+{pkg.bonus} BÔNUS</div>}
                                            <FiStar className={styles.coinMainIcon} />
                                            <h3>{(pkg.amount + pkg.bonus).toLocaleString()}</h3>
                                            <span className={styles.coinPrice}>R$ {pkg.price.toFixed(2)}</span>
                                            <button className={styles.rechargeBtn} onClick={() => handleBuyCoins(pkg)}>COMPRAR</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'inventory' && (
                            <div className={styles.inventoryArea}>
                                <div className={styles.inventoryHeader}>
                                    <div className={styles.invStats}>
                                        <div className={styles.statBox}><FiZap /> <span>{ownedEffects.length} Efeitos</span></div>
                                        <div className={styles.statBox}><FiMonitor /> <span>{ownedFrames.length - 1} Molduras</span></div>
                                        <div className={styles.statBox}><FiGift /> <span>45 Presentes</span></div>
                                    </div>
                                    <p className={styles.invDesc}>Gerencie seus itens cosméticos.</p>
                                </div>

                                <div className={styles.inventorySubHeader}>Molduras Adquiridas</div>
                                <div className={styles.itemsGrid}>
                                    <div className={styles.itemCard + " " + (currentFrame === 'none' ? styles.itemActive : "")}>
                                        <div className={styles.cardHeader}>
                                            <h3>Sem Moldura</h3>
                                            {currentFrame === 'none' && <div className={styles.activePill}>ATIVADO</div>}
                                        </div>
                                        <div className={styles.cardActions}>
                                            <button
                                                className={currentFrame === 'none' ? styles.secondaryBtn : styles.buyMainBtn}
                                                onClick={() => onEquipFrame('none')}
                                            >
                                                {currentFrame === 'none' ? 'ATIVADO' : 'USAR PADRÃO'}
                                            </button>
                                        </div>
                                    </div>
                                    {ownedFrames.filter(id => id !== 'none').map(frameId => {
                                        const frame = nickFrames.find(f => f.id === frameId);
                                        const isActive = currentFrame === frameId;
                                        return (
                                            <div key={frameId} className={styles.itemCard + " " + (isActive ? styles.itemActive : "")}>
                                                <div className={styles.cardHeader}>
                                                    <h3>{frame?.name || ("Moldura " + frameId)}</h3>
                                                    {isActive && <div className={styles.activePill}>ATIVADO</div>}
                                                </div>
                                                <div className={styles.cardActions}>
                                                    {isActive ? (
                                                        <button className={styles.secondaryBtn} onClick={() => onEquipFrame('none')}>DESATIVAR</button>
                                                    ) : (
                                                        <button className={styles.buyMainBtn} onClick={() => onEquipFrame(frameId)}>EQUIPAR</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={styles.inventorySubHeader} style={{ marginTop: '30px' }}>Efeitos de Nick</div>
                                <div className={styles.itemsGrid}>
                                    {ownedEffects.map(effId => {
                                        const effect = nickEffects.find(e => e.id === effId);
                                        const isActive = currentEffect === effId;
                                        return (
                                            <div key={effId} className={styles.itemCard + " " + (isActive ? styles.itemActive : "")}>
                                                <div className={styles.cardHeader}>
                                                    <h3 className={styles["nickEffect_" + effId]}>{effect?.name || effId}</h3>
                                                    {isActive && <div className={styles.activePill}>ATIVADO</div>}
                                                </div>
                                                <div className={styles.cardActions}>
                                                    {isActive ? (
                                                        <button className={styles.secondaryBtn} onClick={() => onEquip('none')}>DESATIVAR</button>
                                                    ) : (
                                                        <button className={styles.buyMainBtn} onClick={() => onEquip(effId)}>EQUIPAR</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={styles.inventorySubHeader} style={{ marginTop: '30px' }}>Meus Pets Companheiros</div>
                                <div className={styles.itemsGrid}>
                                    {ownedPets.map((pet, index) => {
                                        // Handle initial string mock 'fox_3d' or full object
                                        const petData = typeof pet === 'string' ? { id: 1, name: 'Raposinha', img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Raposinha' } : pet;
                                        return (
                                            <div key={index} className={styles.itemCard}>
                                                <div className={styles.cardHeader}>
                                                    <h3>{petData.name}</h3>
                                                    <div className={styles.activePill}>ADOTADO</div>
                                                </div>
                                                <div className={styles.petPreviewContainer}>
                                                    {petData.type === 'video' ? (
                                                        <div className={styles.petIconLarge} style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <ChromaPet videoUrl={petData.url} width={60} height={60} tolerance={petData.tolerance || 100} />
                                                        </div>
                                                    ) : (
                                                        <img src={petData.img} alt={petData.name} className={styles.petIconLarge} />
                                                    )}
                                                </div>
                                                <div className={styles.cardActions}>
                                                    <button className={styles.buyMainBtn} onClick={() => alert(`Pet ${petData.name} equipado!`)}>EQUIPAR</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeSection === 'rankings' && (
                            <div className={styles.rankingsArea}>
                                <div className={styles.rankTabs}>
                                    <button className={styles.rankTabActive}>Top Doadores</button>
                                    <button>Usuários Premium</button>
                                </div>
                                <div className={styles.rankList}>
                                    {[
                                        { pos: 1, user: 'CyberKing', total: '125.400', color: '#ffcc00' },
                                        { pos: 2, user: 'NeonQueen', total: '98.200', color: '#c0c0c0' },
                                    ].map(rank => (
                                        <div key={rank.pos} className={rank.pos === 1 ? (styles.rankRow + " " + styles.rankFirst) : styles.rankRow}>
                                            <div className={styles.rankPos} style={{ color: rank.color }}>#{rank.pos}</div>
                                            <div className={styles.rankUser}><span>{rank.user}</span></div>
                                            <div className={styles.rankValue}><FiStar /> {rank.total}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PremiumShop;
