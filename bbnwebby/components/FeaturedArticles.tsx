import React from "react";

interface Artist {
  name: string;
  specialty: string;
  location: string;
  emoji: string;
}

const artists: Artist[] = [
  { name: "Priya Sharma", specialty: "Bridal Specialist", location: "Mumbai, Maharashtra", emoji: "💄" },
  { name: "Aisha Khan", specialty: "Editorial & Fashion", location: "New Delhi", emoji: "✨" },
  { name: "Neha Patel", specialty: "Natural Glam Expert", location: "Bangalore, Karnataka", emoji: "🌸" },
  { name: "Simran Kaur", specialty: "Party & Events", location: "Pune, Maharashtra", emoji: "🎨" },
];

const FeaturedArtists: React.FC = () => {
  return (
    <section className="featured-artists" id="artists">
      <div className="section-header">
        <p className="section-subtitle">Curated Excellence</p>
        <h2 className="section-title">Meet Our Top Artists</h2>
      </div>
      <div className="artists-grid">
        {artists.map((artist, index) => (
          <div className="artist-card" key={index}>
            <div className="artist-photo">{artist.emoji}</div>
            <div className="artist-info">
              <h3 className="artist-name">{artist.name}</h3>
              <p className="artist-specialty">{artist.specialty}</p>
              <p className="artist-location">📍 {artist.location}</p>
              <button className="view-profile-btn">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedArtists;
