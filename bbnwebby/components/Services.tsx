import React from "react";

interface Service {
  emoji: string;
  title: string;
  description: string;
}

const services: Service[] = [
  { emoji: "👰", title: "Bridal Makeup", description: "Timeless elegance for your special day..." },
  { emoji: "🎉", title: "Party Glam", description: "Make a lasting impression at any celebration..." },
  { emoji: "📸", title: "Editorial Look", description: "High-fashion artistry for photoshoots..." },
  { emoji: "🎬", title: "Photoshoot", description: "Camera-ready perfection tailored to your vision..." },
  { emoji: "🌿", title: "Natural Glow", description: "Enhance your inherent beauty with soft makeup..." },
  { emoji: "🌟", title: "Special Occasion", description: "Celebrate life’s milestones with flawless makeup..." },
];

const ServicesSection: React.FC = () => {
  return (
    <section className="services" id="services">
      <div className="section-header">
        <p className="section-subtitle">What We Offer</p>
        <h2 className="section-title">Our Services</h2>
      </div>
      <div className="services-grid">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-image">
              <span>{service.emoji}</span>
            </div>
            <div className="service-content">
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
