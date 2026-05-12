import { useState } from "react";
import Hero from "../components/home/Hero";
import WhyUs from "../components/home/WhyUs";
import DiscoverySearch from "../components/home/DiscoverySearch";
import ServicesPreview from "../components/home/ServicesPreview";
import PricePreview from "../components/home/PricePreview";
import Testimonials from "../components/home/Testimonials";
import InstagramGrid from "../components/home/InstagramGrid";
import "./home.css"

export default function Home() {
  // Reset to the general/default tenant whenever the user lands on the home
  // page. A previous click on "Book Now" / "All Services" may have pinned
  // the site to a specific salon via localStorage; the home page should
  // always show the global discovery experience unless the URL explicitly
  // asks for a salon (?salon=slug). We clear the slug synchronously during
  // the first render so child components fetch with the cleared value, and
  // notify listeners (the Navbar) after commit via a microtask.
  useState(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("salon") && localStorage.getItem("publicSalonSlug")) {
      localStorage.removeItem("publicSalonSlug");
      queueMicrotask(() => {
        window.dispatchEvent(new Event("publicSalonChanged"));
      });
    }
    return null;
  });

  return (
    <main className="home-page">
      <Hero />

      <section className="home-section home-section-search">
        <DiscoverySearch />
      </section>

      <section className="home-section home-section-whyus">
        <WhyUs />
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
