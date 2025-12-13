import Link from "next/link";

const JoinSection: React.FC = () => (
  <section className="join-section" id="join">
    <div className="join-content">
      <h2>Are You a Makeup Artist?</h2>
      <p>Join BBN and elevate your career to extraordinary heights</p>
      <Link className="join-btn" href="/signup">
        Get Started
      </Link>
    </div>
  </section>
);

export default JoinSection;
