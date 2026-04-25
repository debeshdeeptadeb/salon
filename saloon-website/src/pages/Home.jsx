import OfferBar from "../components/common/OfferBar";
import Hero from "../components/home/Hero";
import DiscoverySearch from "../components/home/DiscoverySearch";
import ServicesPreview from "../components/home/ServicesPreview";
import PricePreview from "../components/home/PricePreview";
import Testimonials from "../components/home/Testimonials";
import InstagramGrid from "../components/home/InstagramGrid";
import "./home.css"

export default function Home() {
  return (
    <main className="home-page"> 
      {/* <OfferBar /> */}
      <Hero />

      <section className="home-section home-section-search">
        <DiscoverySearch />
      </section>

      <section className="home-section home-section-services">
        <ServicesPreview />
      </section>

      <section className="home-section home-section-price">
        <PricePreview />
      </section>

      <section className="home-section home-section-testimonials">
        <Testimonials />
      </section>

      <section className="home-section home-section-gallery">
        <InstagramGrid />
      </section>
    </main>
  );
}
