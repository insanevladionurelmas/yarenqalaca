import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n.jsx";
import Header from "@/components/Header.jsx";
import Hero from "@/components/Hero.jsx";
import PlatformPower from "@/components/PlatformPower.jsx";
import CrossImpact from "@/components/CrossImpact.jsx";
import Categories from "@/components/Categories.jsx";
import CampaignSystem from "@/components/CampaignSystem.jsx";
import SocialSlider from "@/components/SocialSlider.jsx";
import FinalCTA from "@/components/FinalCTA.jsx";
import Footer from "@/components/Footer.jsx";

import { AdminAuthProvider } from "@/admin/AuthContext.jsx";
import ProtectedRoute from "@/admin/ProtectedRoute.jsx";
import AdminLogin from "@/admin/AdminLogin.jsx";
import AdminDashboard from "@/admin/AdminDashboard.jsx";

const Home = () => (
  <LanguageProvider>
    <Header />
    <main>
      <Hero />
      <PlatformPower />
      <CrossImpact />
      <Categories />
      <CampaignSystem />
      <SocialSlider />
      <FinalCTA />
    </main>
    <Footer />
  </LanguageProvider>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
