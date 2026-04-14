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
    <> 
      {/* <OfferBar /> */}
      <Hero />
      <DiscoverySearch />
      <ServicesPreview />
      <PricePreview />
      <Testimonials />
      <InstagramGrid />
    </>
  );
}
