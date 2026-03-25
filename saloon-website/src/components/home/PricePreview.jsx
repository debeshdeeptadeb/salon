import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PricePreview.css";
import { homeContentAPI } from "../../services/api";
import { FiArrowRight } from "react-icons/fi";

const defaultPrices = [
  { service_name: "Hair Styling", price: "₹999+" },
  { service_name: "Nail Care", price: "₹699+" },
  { service_name: "Makeup", price: "₹1999+" },
  { service_name: "Spa Therapy", price: "₹1499+" },
];

export default function PricePreview() {
  const [prices, setPrices] = useState(defaultPrices);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await homeContentAPI.getPrices();
        const data = response.data.data;
        if (data && data.length > 0) {
          setPrices(data);
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        // Use default prices
      }
    };

    fetchPrices();
  }, []);
  return (
    <section className="price-section">
      <h2 className="section-title">Treatments & Prices</h2>

      <div className="price-card">
        {prices.map((p, index) => (
          <div className="price-row" key={index}>
            <span className="price-name">{p.service_name}</span>
            <span className="price-amount">{p.price}</span>
          </div>
        ))}
      </div>

      <div className="price-cta">
        <button className="primary-btn" onClick={() => navigate("/catalogue")}>
          <span>View Full Catalogue</span>
          <FiArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
