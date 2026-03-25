import "./InstagramGrid.css";
import { FaInstagram } from "react-icons/fa";

const images = [
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800&auto=format&fit=crop",
];

export default function InstagramGrid() {
  return (
    <section className="insta-section">
      <h2 className="section-title">Follow Us on Instagram</h2>

      <div className="insta-grid">
        {images.map((img, i) => (
          <div className="insta-card" key={i}>
            <img src={img} alt="Salon work" />
            <div className="insta-overlay">
              <FaInstagram className="insta-social-icon" aria-hidden="true" />
              <span>View on Instagram</span>
            </div>
          </div>
        ))}
      </div>

      <div className="insta-cta">
        <a
          href="https://instagram.com/minjal.salon"
          className="btn-primary btn-lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow @minjal.salon
        </a>
      </div>
    </section>
  );
}
