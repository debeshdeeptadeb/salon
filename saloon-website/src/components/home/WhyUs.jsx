import {
    HiOutlineShieldCheck,
    HiOutlineClock,
    HiOutlineSparkles,
    HiOutlineHeart,
} from "react-icons/hi2";
import "./WhyUs.css";

const reasons = [
    {
        icon: HiOutlineShieldCheck,
        title: "Verified Professionals",
        desc: "Background-checked, certified stylists with proven experience.",
    },
    {
        icon: HiOutlineClock,
        title: "On-Time, Every Time",
        desc: "Punctual service so your day stays exactly on schedule.",
    },
    {
        icon: HiOutlineSparkles,
        title: "Premium Products",
        desc: "Salon-grade brands trusted by the best in the industry.",
    },
    {
        icon: HiOutlineHeart,
        title: "Hygiene Assured",
        desc: "Sanitized tools and single-use disposables for every guest.",
    },
];

export default function WhyUs() {
    return (
        <section className="whyus" aria-labelledby="whyus-heading">
            <div className="container whyus-container">
                <header className="whyus-header">
                    <p className="whyus-eyebrow">Why choose us</p>
                    <h2 id="whyus-heading" className="whyus-title">
                        A salon experience, <span>elevated.</span>
                    </h2>
                    <p className="whyus-lead">
                        Four promises that turn an ordinary visit into a moment you'll
                        look forward to.
                    </p>
                </header>

                <div className="whyus-grid">
                    {reasons.map(({ icon: Icon, title, desc }) => (
                        <article key={title} className="whyus-card">
                            <div className="whyus-icon" aria-hidden>
                                <Icon />
                            </div>
                            <h3>{title}</h3>
                            <p>{desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
