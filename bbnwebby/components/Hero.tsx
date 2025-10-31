"use client";

import React from "react";
import styles from "./HeroSection.module.css";

/**
 * HeroSection component
 * Displays a luxurious hero section with animated ornaments,
 * shimmer lines, and a central call-to-action.
 */
const HeroSection: React.FC = () => {
  return (
    <section className={styles.hero} id="home">
      {/* Decorative rotating circles */}
      <div className={styles.heroOrnament}></div>
      <div className={styles.heroOrnament}></div>

      {/* Vertical shimmering lines */}
      <div className={styles.shimmerLine}></div>
      <div className={styles.shimmerLine}></div>
      <div className={styles.shimmerLine}></div>

      {/* Main content */}
      <div className={styles.heroContent}>
        <h1 className={styles.heroSubtitle}>Beyond Beauty Network</h1>
        <p>Discover Your Perfect<br />Makeup Artist</p>
        <button className={styles.ctaBtn}>Find an Artist</button>
      </div>
    </section>
  );
};

export default HeroSection;
