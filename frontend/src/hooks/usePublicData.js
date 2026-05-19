import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FALLBACK = {
  brands: [
    "NYX Professional Makeup", "Sephora", "Adidas", "L'Oréal Paris",
    "Maybelline", "YSL Beauty", "Lancôme", "Benefit Cosmetics",
    "Too Faced", "Swarovski", "Netflix", "Prime Video",
    "CeraVe", "Bioderma", "OGX", "Philips",
    "Sensodyne", "Colgate", "Vaseline", "ghd", "Make Up For Ever",
  ],
  audience_gender_primary: { women: 61, men: 37, other: 2 },
  audience_gender_secondary: { women: 52.3, men: 47.7 },
  age_ranges: [
    { label: "18–24", value: 49.3 },
    { label: "25–34", value: 36.9 },
    { label: "35–44", value: 7.0 },
    { label: "13–17", value: 3.5 },
  ],
  top_countries_audience: [
    { name: "Turkey", value: 91.3 },
    { name: "Azerbaijan", value: 2.3 },
    { name: "Germany", value: 1.0 },
    { name: "Cyprus", value: 0.9 },
  ],
  top_countries_location: [
    { name: "Turkey", value: 59.9 },
    { name: "United States", value: 8.9 },
    { name: "Azerbaijan", value: 2.0 },
    { name: "Germany", value: 0.9 },
    { name: "Brazil", value: 0.6 },
  ],
  media_kit_cta_title: "Request Full Media Kit",
  media_kit_cta_text: "Get updated audience data, platform statistics, campaign formats and collaboration options.",
  media_kit_cta_button: "Request Media Kit",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(FALLBACK);
  useEffect(() => {
    axios.get(`${API}/site-settings`).then(({ data }) => {
      setSettings({ ...FALLBACK, ...(data || {}) });
    }).catch(() => {});
  }, []);
  return settings;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API}/campaigns`).then(({ data }) => setCampaigns(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { campaigns, loading };
}
