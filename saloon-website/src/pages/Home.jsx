import OfferBar from "../components/common/OfferBar";
import Hero from "../components/home/Hero";
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
      <ServicesPreview />
      <PricePreview />
      <Testimonials />
      <InstagramGrid />
    </>
  );
}
