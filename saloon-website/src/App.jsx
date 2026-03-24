import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Catalogue from "./pages/Catalogue";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SalonQR from "./pages/SalonQR";

// Admin pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import ServicesManagement from "./pages/admin/ServicesManagement";
import CatalogueManagement from "./pages/admin/CatalogueManagement";
import GalleryManagement from "./pages/admin/GalleryManagement";
import OffersManagement from "./pages/admin/OffersManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import EnquiriesManagement from "./pages/admin/EnquiriesManagement";
import SiteSettings from "./pages/admin/SiteSettings";
import HomeContentManagement from "./pages/admin/HomeContentManagement";
import QRCodeManagement from "./pages/admin/QRCodeManagement";
import BookingsManagement from "./pages/admin/BookingsManagement";
import PlatformSalons from "./pages/admin/PlatformSalons";
import SalonStaff from "./pages/admin/SalonStaff";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
          <Route path="/catalogue" element={<><Navbar /><Catalogue /><Footer /></>} />
          <Route path="/gallery" element={<><Navbar /><Gallery /><Footer /></>} />
          <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
          <Route path="/salon/:qrCodeId" element={<SalonQR />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="catalogue" element={<CatalogueManagement />} />
            <Route path="gallery" element={<GalleryManagement />} />
            <Route path="offers" element={<OffersManagement />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="home-content" element={<HomeContentManagement />} />
            <Route path="enquiries" element={<EnquiriesManagement />} />
            <Route path="qr-codes" element={<QRCodeManagement />} />
            <Route path="bookings" element={<BookingsManagement />} />
            <Route path="platform/salons" element={<PlatformSalons />} />
            <Route path="platform/staff" element={<SalonStaff />} />
          </Route>
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
