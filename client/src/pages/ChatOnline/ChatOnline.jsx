import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatOnline.module.css';
import PremiumShop from './PremiumShop';
import EmojiPicker from 'emoji-picker-react';
import ChromaPet from './ChromaPet';
import {
    FiSend, FiSmile, FiImage, FiMic, FiPaperclip, FiGift, FiUserPlus,
    FiX, FiSlash, FiAlertOctagon, FiSettings, FiStar, FiZap, FiPlus, FiDroplet,
    FiMessageSquare, FiUsers, FiUser
} from 'react-icons/fi';

const ChatOnline = () => {
    const [activeTab, setActiveTab] = useState('chat'); // 'users', 'chat', 'profile'
    const [userListTab, setUserListTab] = useState('all'); // 'all', 'friends'
    const [message, setMessage] = useState('');
    const [toasts, setToasts] = useState([]);
    const [selectedUser, setSelectedUser] = useState({ id: 2, nick: 'NeonQueen', status: 'typing', effect: 'electric', frame: 'none', pet: { name: 'Gato Cyber', img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gato%20Cyber', type: 'image' }, rank: 'Premium', avatar: 'https://i.pravatar.cc/150?u=2' });

    // MOCK LOGGED USER (ADMIN)
    const currentUser = { id: 99, nick: 'Marcelo_Premium', rank: 'Admin', avatar: 'https://i.pravatar.cc/150?u=99' };

    const addToast = (title, msg, icon) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, msg, icon }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const mockFriends = [
        { id: 2, nick: 'NeonQueen', status: 'typing', effect: 'electric', frame: 'none', rank: 'Premium', avatar: 'https://i.pravatar.cc/150?u=2' },
        { id: 5, nick: 'CyberGhost', status: 'online', effect: 'holo', frame: 'none', rank: 'MVP', avatar: 'https://i.pravatar.cc/150?u=5' },
    ];
    const [isProfileChanging, setIsProfileChanging] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [showShopModal, setShowShopModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [sendingGift, setSendingGift] = useState(null);
    const [shopPreviewEffect, setShopPreviewEffect] = useState('neon');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef(null);
    const messagesEndRef = useRef(null);

    const mockUsers = [
        { id: 1, nick: 'CyberKing', status: 'online', effect: 'neon', frame: 'none', pet: { name: 'Raposinha', img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Raposinha' }, rank: 'Admin', avatar: 'https://i.pravatar.cc/150?u=1' },
        { id: 2, nick: 'NeonQueen', status: 'typing', effect: 'electric', frame: 'none', pet: { name: 'Gato Cyber', img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gato%20Cyber' }, rank: 'Premium', avatar: 'https://i.pravatar.cc/150?u=2' },
        { id: 3, nick: 'FireStorm', status: 'online', effect: 'fire', frame: 'none', pet: null, rank: 'VIP', avatar: 'https://i.pravatar.cc/150?u=3' },
        { id: 4, nick: 'IceCold', status: 'away', effect: 'ice', frame: 'none', pet: { name: 'Pinguim', img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Pinguim' }, rank: 'Member', avatar: 'https://i.pravatar.cc/150?u=4' },
        { id: 5, nick: 'GamerX', status: 'online', effect: 'rgb', frame: 'none', pet: null, rank: 'Membro', avatar: 'https://i.pravatar.cc/150?u=5' },
    ];

    const [messages, setMessages] = useState([
        { id: 1, user: mockUsers[0], text: 'Welcome to the premium chat! 🚀', time: '21:40' },
        { id: 2, user: mockUsers[2], text: 'Tudo pronto para a nova era do Chat Online.', time: '21:41' },
        { id: 3, user: mockUsers[1], text: 'Os efeitos estão ficando insanos!', time: '21:42' },
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            user: { id: 99, nick: 'Marcelo_Premium', status: 'online', effect: selectedUser.effect || 'neon', frame: selectedUser.frame || 'none', pet: selectedUser.pet, rank: 'Admin', avatar: 'https://i.pravatar.cc/150?u=99' },
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        setShowEmojiPicker(false);
    };

    const onEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
    };

    const gifts = [
        { id: 1, name: 'Diamante', price: 50, icon: '💎', color: '#00ffff' },
        { id: 2, name: 'Coroa', price: 200, icon: '👑', color: '#ffcc00' },
        { id: 3, name: 'Coração', price: 10, icon: '❤️', color: '#ff4757' },
        { id: 4, name: 'Fogo', price: 30, icon: '🔥', color: '#ff6600' },
        { id: 5, name: 'Estrela', price: 100, icon: '⭐', color: '#ffff00' },
        { id: 6, name: 'Raio', price: 150, icon: '⚡', color: '#00ffcc' },
    ];

    const shopEffects = [
        { id: 'neon', name: 'Pink Neon Glow', price: 500, effect: 'neon' },
        { id: 'fire', name: 'Inferno Fire', price: 1200, effect: 'fire' },
        { id: 'electric', name: 'Electric Zap', price: 800, effect: 'electric' },
        { id: 'rgb', name: 'Cyber Rainbow', price: 1500, effect: 'rgb' },
        { id: 'ice', name: 'Ice Crystal', price: 600, effect: 'ice' },
    ];

    const handleSendGift = (gift) => {
        setSendingGift({ ...gift, target: selectedUser.nick });
        addToast('NOVA INTERAÇÃO 🎁', `Você enviou ${gift.name} para ${selectedUser.nick}!`, gift.icon);
        setShowGiftModal(false);
        setTimeout(() => setSendingGift(null), 4000);
    };

    const handleBuyEffect = (effect) => {
        alert(`Você adquiriu o efeito ${effect.name}! Estilo atualizado.`);
        setShowShopModal(false);
    };



    const handleUserSelect = (user) => {
        if (selectedUser.id === user.id) return;
        setIsProfileChanging(true);
        setTimeout(() => {
            setSelectedUser(user);
            setIsProfileChanging(false);
            if (window.innerWidth <= 1024) setActiveTab('profile');
        }, 300);
    };

    const getNickStyle = (effect) => {
        return `${styles.nick} ${styles[`nickEffect_${effect}`]}`;
    };

    const renderNickWithFrame = (user, showPet = false) => {
        const PetDisplay = () => {
            if (!user.pet) return null;

            if (user.pet.type === 'video') {
                return (
                    <div className={styles.petContainer} title={user.pet.name}>
                        <ChromaPet videoUrl={user.pet.url} width={40} height={40} tolerance={120} />
                    </div>
                );
            }

            return (
                <div className={styles.petContainer} title={user.pet.name}>
                    <img src={user.pet.img || user.pet.url} alt={user.pet.name} className={styles.petIcon} />
                </div>
            );
        };

        if (!user.frame || user.frame === 'none') {
            return (
                <div className={styles.nickWrapper}>
                    {showPet && <PetDisplay />}
                    <span className={getNickStyle(user.effect)}>{user.nick}</span>
                </div>
            );
        }
        return (
            <div className={styles.nickWrapper}>
                {showPet && <PetDisplay />}
                <div className={`${styles.frame} ${styles[`frame_${user.frame}`]}`}>
                    <span className={getNickStyle(user.effect)}>{user.nick}</span>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.chatPage}>
            <div className={styles.chatContainer}>

                {/* 1. USERS LIST - Left Column (Hidden on mobile unless activeTab === 'users') */}
                <aside className={`${styles.usersList} ${activeTab === 'users' ? styles.tabActive : ''}`}>
                    <div className={styles.columnHeader}>
                        <FiUsers /> <span>{userListTab === 'all' ? 'Usuários Online' : 'Meus Amigos'}</span>
                    </div>

                    <div className={styles.listSwitcher}>
                        <button
                            className={userListTab === 'all' ? styles.activeListBtn : ''}
                            onClick={() => setUserListTab('all')}
                        >
                            Todos
                        </button>
                        <button
                            className={userListTab === 'friends' ? styles.activeListBtn : ''}
                            onClick={() => setUserListTab('friends')}
                        >
                            Amigos <span className={styles.countBadge}>{mockFriends.length}</span>
                        </button>
                    </div>

                    <div className={styles.scrollArea}>
                        {(userListTab === 'all' ? mockUsers : mockFriends).map(u => (
                            <div
                                key={u.id}
                                className={`${styles.userItem} ${selectedUser.id === u.id ? styles.selected : ''}`}
                                onClick={() => handleUserSelect(u)}
                            >
                                <div className={styles.avatarWrapper}>
                                    <img src={u.avatar} alt={u.nick} />
                                    <div className={`${styles.statusDot} ${styles[u.status]}`} />
                                </div>
                                <div className={styles.userInfo}>
                                    {renderNickWithFrame(u, true)} {/* SHOW PET HERE */}
                                    <span className={styles.userRank}>{u.rank}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 2. CHAT AREA - Center Column (Main content) */}
                <main className={`${styles.chatMain} ${activeTab === 'chat' ? styles.tabActive : ''}`}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerInfo}>
                            <FiMessageSquare /> <span>Canal Geral</span>
                        </div>
                        <div className={styles.headerStats}>
                            <button className={styles.openShopBtn} onClick={() => setShowShopModal(true)}>
                                <FiStar /> Loja de Efeitos
                            </button>
                            <span className={styles.statItem}><FiUsers /> 1,245 Total</span>
                        </div>
                    </div>

                    <div className={styles.messagesContainer} ref={scrollRef}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`${styles.messageBubble} ${msg.user.id === currentUser.id ? styles.myMessage : ''}`}>
                                <img src={msg.user.avatar} alt={msg.user.nick} className={styles.msgAvatar} />
                                <div className={styles.msgContent} onClick={() => handleUserSelect(msg.user)}>
                                    <div className={styles.msgHeader}>
                                        {renderNickWithFrame(msg.user, false)} {/* NO PET HERE */}
                                        <span className={styles.msgTime}>{msg.time}</span>
                                    </div>
                                    <p className={styles.msgText}>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {sendingGift && (
                            <div className={styles.giftAnnouncement}>
                                <div className={styles.giftIconAnim}>{sendingGift.icon}</div>
                                <p>Você enviou um <strong>{sendingGift.name}</strong> para <strong>{sendingGift.target}</strong>!</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        {showEmojiPicker && (
                            <div className={styles.emojiPickerContainer}>
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme="dark"
                                    width="100%"
                                    height="350px"
                                />
                            </div>
                        )}
                        <div className={styles.inputWrapper}>
                            <button className={styles.attachmentBtn} onClick={() => setShowShopModal(true)} title="Personalizar Nick">
                                <FiZap />
                            </button>
                            <input
                                type="text"
                                placeholder="Digite sua mensagem futurista..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <div className={styles.inputActions}>
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}><FiSmile /></button>
                                <button><FiImage /></button>
                                <button onClick={() => setShowGiftModal(true)}><FiGift /></button>
                                <button className={styles.sendBtn} onClick={handleSendMessage}><FiSend /></button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 3. PROFILE - Right Column (Hidden on mobile unless activeTab === 'profile') */}
                <aside className={`${styles.profileColumn} ${activeTab === 'profile' ? styles.tabActive : ''}`}>
                    <div className={styles.columnHeader}>
                        <FiUser /> <span>Perfil Selecionado</span>
                    </div>
                    <div className={`${styles.profileCard} ${isProfileChanging ? styles.changing : ''}`}>
                        <div className={styles.profileMain}>
                            <div className={styles.bigAvatarWrapper}>
                                <img src={selectedUser.avatar} alt={selectedUser.nick} />
                                <div className={styles.levelBadge}>LVL {Math.floor(Math.random() * 50) + 10}</div>
                            </div>
                            {renderNickWithFrame(selectedUser, true)} {/* SHOW PET IN PROFILE SIDEBAR */}
                            <span className={styles.userRankBadge}>{selectedUser.rank}</span>
                            <button className={styles.viewDetailedBtn} onClick={() => setShowProfileModal(true)}>
                                <FiUser /> Ver Perfil Detalhado
                            </button>
                            <p className={styles.statusMsg}>"Explorando o futuro do TopHitsBr 🚀"</p>
                        </div>

                        <div className={styles.xpBar}>
                            <div className={styles.xpLabel}>
                                <span>Progresso XP</span>
                                <span>{Math.floor(Math.random() * 60) + 30}%</span>
                            </div>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill} style={{ width: '85%' }} />
                            </div>
                        </div>

                        <div className={styles.profileActions}>
                            <button className={styles.actionBtnPrimary}><FiMessageSquare /> Mensagem Privada</button>
                            <button className={styles.actionBtn}><FiUserPlus /> Adicionar Amigo</button>
                            <button className={styles.actionBtn} onClick={() => setShowGiftModal(true)}><FiGift /> Enviar Presente</button>
                            <div className={styles.dangerZone}>
                                <button className={styles.smallBtn}><FiSlash /> Bloquear</button>
                                <button className={styles.smallBtn}><FiAlertOctagon /> Denunciar</button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* GIFT MODAL OVERLAY */}
                {showGiftModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowGiftModal(false)}>
                        <div className={styles.giftModal} onClick={e => e.stopPropagation()}>
                            <h3>Escolha um Presente para {selectedUser.nick}</h3>
                            <div className={styles.giftsGrid}>
                                {gifts.map(g => (
                                    <div key={g.id} className={styles.giftCard} onClick={() => handleSendGift(g)}>
                                        <span className={styles.giftIcon}>{g.icon}</span>
                                        <span className={styles.giftName}>{g.name}</span>
                                        <span className={styles.giftPrice}><FiStar /> {g.price}</span>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.closeModal} onClick={() => setShowGiftModal(false)}><FiX /></button>
                        </div>
                    </div>
                )}

                {/* DETAILED PROFILE MODAL */}
                {showProfileModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
                        <div className={styles.profileModal} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeModal} onClick={() => setShowProfileModal(false)}><FiX /></button>

                            <div className={styles.modalProfileHeader}>
                                <div className={styles.modalAvatarWrapper}>
                                    <img src={selectedUser.avatar} alt={selectedUser.nick} />
                                    <div className={styles.modalLevelBadge}>LEVEL 42</div>
                                </div>
                                <div className={styles.modalHeroInfo}>
                                    {renderNickWithFrame(selectedUser, true)} {/* SHOW PET IN DETAILED MODAL */}
                                    <div className={styles.badgeRow}>
                                        <span className={styles.badgeElite}><FiStar /> ELITE</span>
                                        <span className={styles.badgeDonator}><FiGift /> DOADOR</span>
                                        <span className={styles.badgeVip}><FiShield /> VIP</span>
                                    </div>
                                    <p className={styles.memberSince}>Membro desde Outubro 2025</p>
                                </div>
                            </div>

                            <div className={styles.modalStatsGrid}>
                                <div className={styles.statCard}>
                                    <span className={styles.statVal}>1.2k</span>
                                    <span className={styles.statLab}>Mensagens</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statVal}>45</span>
                                    <span className={styles.statLab}>Presentes</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statVal}>250</span>
                                    <span className={styles.statLab}>Amigos</span>
                                </div>
                            </div>

                            <div className={styles.giftWall}>
                                <h3>Mural de Presentes Recentes</h3>
                                <div className={styles.giftList}>
                                    {gifts.map(g => (
                                        <div key={g.id} className={styles.wallGift} title={g.name}>
                                            <span className={styles.wallIcon}>{g.icon}</span>
                                            <span className={styles.wallCount}>x{Math.floor(Math.random() * 5) + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.actionBtnPrimary}><FiMessageSquare /> Iniciar Chat Privado</button>
                                <button className={styles.actionBtn}><FiUserPlus /> Enviar Pedido de Amizade</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* INTEGRATED PREMIUM SHOP */}
                {showShopModal && (
                    <PremiumShop
                        onClose={() => setShowShopModal(false)}
                        currentEffect={selectedUser.effect}
                        onEquip={(newEff) => setSelectedUser(prev => ({ ...prev, effect: newEff }))}
                        currentFrame={selectedUser.frame}
                        onEquipFrame={(newFrame) => setSelectedUser(prev => ({ ...prev, frame: newFrame }))}
                        currentPet={selectedUser.pet}
                        onEquipPet={(newPet) => setSelectedUser(prev => ({ ...prev, pet: newPet }))}
                        currentUserRank={currentUser.rank}
                    />
                )}

                {/* MOBILE TAB NAVIGATION */}
                <nav className={styles.mobileTabs}>
                    <button
                        className={activeTab === 'users' ? styles.tabBtnActive : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers /> <span>Usuários</span>
                    </button>
                    <button
                        className={activeTab === 'chat' ? styles.tabBtnActive : ''}
                        onClick={() => setActiveTab('chat')}
                    >
                        <FiMessageSquare /> <span>Chat</span>
                    </button>
                    <button
                        className={activeTab === 'profile' ? styles.tabBtnActive : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FiUser /> <span>Perfil</span>
                    </button>
                </nav>

                {/* GLOBAL ACTIVITY TOASTS */}
                <div className={styles.toastContainer}>
                    {toasts.map(toast => (
                        <div key={toast.id} className={styles.toast}>
                            <div className={styles.toastIcon}>{toast.icon}</div>
                            <div className={styles.toastContent}>
                                <h4>{toast.title}</h4>
                                <p>{toast.msg}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatOnline;
