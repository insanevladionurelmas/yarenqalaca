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

const Home = () => (
  <>
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
  </>
);

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </div>
  );
}

export default App;
