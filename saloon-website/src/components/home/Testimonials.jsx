import "./Testimonials.css"
const testimonials = [
  {
    name: "Ananya S.",
    city: "Bhubaneswar",
    text: "Absolutely loved the ambience and service. Very professional staff!",
  },
  {
    name: "Rahul M.",
    city: "Bhubaneswar",
    text: "Clean, premium and worth every rupee. Highly recommended.",
  },
  {
    name: "Priya K.",
    city: "Bhubaneswar",
    text: "Best unisex salon experience I’ve had in the city.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>

        <div className="testimonial-slider">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="stars">★★★★★</div>
              <p className="quote">“{t.text}”</p>
              <span className="author">
                {t.name}, {t.city}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
