import React from "react";

interface Testimonial {
  text: string;
  name: string;
  initial: string;
}

const testimonials: Testimonial[] = [
  { text: "BBN transformed my wedding day experience...", name: "Ananya Reddy", initial: "A" },
  { text: "Professional, reliable, and extraordinarily talented...", name: "Meera Singh", initial: "M" },
  { text: "The caliber of artists on this platform is unparalleled...", name: "Rhea Kapoor", initial: "R" },
];

const Testimonials: React.FC = () => (
  <section className="testimonials">
    <div className="section-header">
      <p className="section-subtitle">Client Experiences</p>
      <h2 className="section-title">What Our Clients Say</h2>
    </div>
    <div className="testimonials-container">
      {testimonials.map((t, i) => (
        <div className="testimonial-card" key={i}>
          <div className="quote-icon"></div>
          <p className="testimonial-text">{t.text}</p>
          <div className="testimonial-author">
            <div className="author-photo">{t.initial}</div>
            <div className="author-info">
              <div className="author-name">{t.name}</div>
              <div className="stars">★★★★★</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
