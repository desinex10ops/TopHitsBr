import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';

// Components
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import CarModeOverlay from './components/CarModeOverlay/CarModeOverlay';
import ConfirmModal from './components/ConfirmModal/ConfirmModal';
import MainLayout from './components/MainLayout/MainLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home/Home'));
const Upload = lazy(() => import('./pages/Upload/Upload'));
const GenreDetails = lazy(() => import('./pages/Genres/GenreDetails'));
const Genres = lazy(() => import('./pages/Genres/Genres'));
const PlaylistDetails = lazy(() => import('./pages/Playlists/PlaylistDetails'));
const PenDrive = lazy(() => import('./pages/PenDrive/PenDrive'));
const ShopHome = lazy(() => import('./pages/Shop/ShopHome'));
const Cart = lazy(() => import('./pages/Shop/Cart'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const ProducerStore = lazy(() => import('./pages/Shop/ProducerStore'));
const ProductDetails = lazy(() => import('./pages/Shop/ProductDetails'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const RegisterProducer = lazy(() => import('./pages/Auth/RegisterProducer'));
const AlbumDetails = lazy(() => import('./pages/Album/AlbumDetails'));
const LikedSongs = lazy(() => import('./pages/LikedSongs/LikedSongs'));
const Karaoke = lazy(() => import('./pages/Karaoke/Karaoke'));
const Wallet = lazy(() => import('./pages/Wallet/Wallet'));
const ArtistProfile = lazy(() => import('./pages/Artist/ArtistProfile'));
const About = lazy(() => import('./pages/Info/About'));
const Careers = lazy(() => import('./pages/Info/Careers'));
const Contact = lazy(() => import('./pages/Info/Contact'));
const Advertise = lazy(() => import('./pages/Info/Advertise'));
const Terms = lazy(() => import('./pages/Info/Terms'));
const Privacy = lazy(() => import('./pages/Info/Privacy'));
const Cookies = lazy(() => import('./pages/Info/Cookies'));
const HelpDownload = lazy(() => import('./pages/Info/HelpDownload'));
const HelpLogin = lazy(() => import('./pages/Info/HelpLogin'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications')); // [NEW] Notification Page
const UserProfile = lazy(() => import('./pages/User/UserProfile')); // [NEW] Public User Profile
const Library = lazy(() => import('./pages/Library/Library')); // [NEW] Unified Library

const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard/AdminDashboard'));
const AdminTracks = lazy(() => import('./pages/Admin/Content/AdminTracks'));
const AdminContent = lazy(() => import('./pages/Admin/Content/AdminContent'));
const AdminHighlights = lazy(() => import('./pages/Admin/Highlights/AdminHighlights'));
const AdminUsers = lazy(() => import('./pages/Admin/Users/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings/AdminSettings'));
const AdminCredits = lazy(() => import('./pages/Admin/Credits/AdminCredits'));
const AdminPiracyLogs = lazy(() => import('./pages/Admin/Security/AdminPiracyLogs'));
const AdminComments = lazy(() => import('./pages/Admin/Comments/AdminComments'));
const AdminMarketing = lazy(() => import('./pages/Admin/Marketing/AdminMarketing'));
const AdminTeam = lazy(() => import('./pages/Admin/Users/AdminTeam'));

import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  console.log("Rendering App component - Updated MainLayout Integration");
  const location = useLocation();

  return (
    <div className="app-container">
      <ToastContainer theme="dark" position="bottom-right" />
      <NotificationProvider>
        <MainLayout>
          <CarModeOverlay />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopHome />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/shop/store/:username" element={<ProducerStore />} />
              <Route path="/shop/product/:id" element={<ProductDetails />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/genre/:genre" element={<GenreDetails />} />
              <Route path="/playlist/:id" element={<PlaylistDetails />} />
              <Route path="/pen-drive" element={<PenDrive />} />
              <Route path="/karaoke" element={<Karaoke />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
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
              <Route path="/album/:id" element={<AlbumDetails />} />
              <Route path="/artist/:id" element={<ArtistProfile />} />
              <Route path="/user/:id" element={<UserProfile />} />

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
                <Route path="albums" element={<AdminContent />} />
                <Route path="highlights" element={<AdminHighlights />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="credits" element={<AdminCredits />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="piracy-logs" element={<AdminPiracyLogs />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Notificações */}
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />

            </Routes>
          </Suspense>
          <ConfirmModal />
        </MainLayout>
      </NotificationProvider>
    </div>
  );
}

export default App;
