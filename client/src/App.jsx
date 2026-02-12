import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import GenreDetails from './pages/Genres/GenreDetails';
import Genres from './pages/Genres/Genres';
import Admin from './pages/Admin/Admin';
import PlaylistDetails from './pages/Playlists/PlaylistDetails';
import PenDrive from './pages/PenDrive/PenDrive';
import ShopHome from './pages/Shop/ShopHome'; // [NEW] Shop
import Cart from './pages/Shop/Cart'; // [NEW] Cart
import Checkout from './pages/Checkout/Checkout'; // [NEW] Checkout
import ProducerStore from './pages/Shop/ProducerStore'; // [NEW] Producer Store
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RegisterProducer from './pages/Auth/RegisterProducer'; // [NEW]
import AlbumDetails from './pages/Album/AlbumDetails';
import LikedSongs from './pages/LikedSongs/LikedSongs';
import Karaoke from './pages/Karaoke/Karaoke';
import Wallet from './pages/Wallet/Wallet';
import ArtistProfile from './pages/Artist/ArtistProfile';
import About from './pages/Info/About';
import Careers from './pages/Info/Careers';
import Contact from './pages/Info/Contact';
import Advertise from './pages/Info/Advertise';
import Terms from './pages/Info/Terms';
import Privacy from './pages/Info/Privacy';
import Cookies from './pages/Info/Cookies';

import HelpDownload from './pages/Info/HelpDownload';
import HelpLogin from './pages/Info/HelpLogin';

import DashboardLayout from './pages/Dashboard/DashboardLayout'; // To be created
import ProtectedRoute from './components/ProtectedRoute'; // To be created

// Admin Pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import AdminTracks from './pages/Admin/Content/AdminTracks';
import AdminHighlights from './pages/Admin/Highlights/AdminHighlights';
import AdminUsers from './pages/Admin/Users/AdminUsers';
import AdminSettings from './pages/Admin/Settings/AdminSettings';
import AdminCredits from './pages/Admin/Credits/AdminCredits';
import AdminPiracyLogs from './pages/Admin/Security/AdminPiracyLogs';

import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Player from './components/Player/Player';
import { ToastProvider } from './contexts/ToastContext';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { CartProvider } from './contexts/CartContext'; // [NEW]
import MobileMenu from './components/MobileMenu/MobileMenu';
import CarModeOverlay from './components/CarModeOverlay/CarModeOverlay';
import ConfirmModal from './components/ConfirmModal/ConfirmModal';
import DynamicThemeController from './components/DynamicThemeController/DynamicThemeController';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  console.log("Rendering App component");
  const location = useLocation();

  // Ocultar player e sidebar nas rotas de auth e dashboard (dashboard terá seu próprio layout)
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const showMainLayout = !isAuthRoute && !isDashboardRoute;

  return (
    <div className="app-container">
      <ToastContainer theme="dark" position="bottom-right" />
      {/* {showMainLayout && <DynamicThemeController />} */}
      {showMainLayout && <Sidebar />}
      {showMainLayout && <Header />}

      <div className={showMainLayout ? "main-content" : "full-content"}>
        <CarModeOverlay />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopHome />} /> {/* [NEW] Shop Route */}
          <Route path="/cart" element={<Cart />} /> {/* [NEW] Cart Route */}
          <Route path="/checkout" element={<Checkout />} /> {/* [NEW] Checkout Route */}
          <Route path="/shop/store/:username" element={<ProducerStore />} /> {/* [NEW] Producer Store */}
          <Route path="/genres" element={<Genres />} />
          <Route path="/genre/:genre" element={<GenreDetails />} />
          <Route path="/playlist/:id" element={<PlaylistDetails />} />
          <Route path="/pendrive" element={<PenDrive />} />
          <Route path="/karaoke" element={<Karaoke />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />

          <Route path="/cookies" element={<Cookies />} />
          <Route path="/help/download" element={<HelpDownload />} />
          <Route path="/help/login" element={<HelpLogin />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-producer" element={<RegisterProducer />} />

          {/* Dashboard Privado */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />

          {/* Rotas Públicas de Detalhes */}
          <Route path="/album/:artist/:album" element={<AlbumDetails />} />
          <Route path="/artist/:id" element={<ArtistProfile />} />

          {/* Carteira de Créditos */}
          <Route path="/wallet" element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          } />

          <Route path="/liked-songs" element={<LikedSongs />} />

          {/* Legado / Admin */}
          <Route path="/upload" element={<Upload />} />
          {/* Admin CMS */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tracks" element={<AdminTracks />} />
            <Route path="highlights" element={<AdminHighlights />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="credits" element={<AdminCredits />} />
            <Route path="piracy-logs" element={<AdminPiracyLogs />} />
            {/* Redirect root /admin to /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Routes>

        {showMainLayout && <Footer />}
      </div>

      {showMainLayout && <Player />}
      {/* Player deve aparecer no dashboard também, mas talvez com estilo diferente se precisar */}
      {isDashboardRoute && <Player />}

      {showMainLayout && <MobileMenu />}
      {isDashboardRoute && <MobileMenu />} {/* Menu mobile também útil no dashboard? Talvez o dashboard tenha o seu próprio */}



      <ConfirmModal />
    </div>
  );
}



function MainRoot() {
  console.log("Rendering MainRoot component");
  return (

    <AuthProvider>
      <ToastProvider>
        <PlayerProvider>
          <CartProvider> {/* CartProvider wrapping App */}
            <App />
          </CartProvider>
        </PlayerProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default MainRoot;
