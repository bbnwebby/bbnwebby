import React from "react";
import Link from "next/link";

const Footer: React.FC = () => (
  <footer>
    <div className="footer-content">


        <div className="footer-section">
          <h4>Quick Links</h4>
          <div className="footer-links">
            {["home", "services", "artists", "about", "contact"].map((link) => (
              <Link href={`#${link}`} key={link}>
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </Link>
            ))}
          </div>
        </div>


      

      <div className="footer-bottom">
        <p>© 2025 Beyond Beauty Network. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
