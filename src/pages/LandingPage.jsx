import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle("menu-open", isOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);
  const handleFindMatch = (event) => {
    event.preventDefault();
    closeMenu();
    navigate("/login");
  };

  return (
    <section className="hero" aria-label="SwapSkills welcome">
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__blob hero__blob--teach" />
        <span className="hero__blob hero__blob--learn" />
        <span className="hero__blob hero__blob--neutral" />
      </div>

      <header className="hero-nav">
        <Link
          to="/"
          className="hero-brand"
          aria-label="SwapSkills home"
          onClick={closeMenu}
        >
          <svg
            className="hero-brand__mark"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12.5 4.5H7.8a3.3 3.3 0 0 0-3.3 3.3v9.4a3.3 3.3 0 0 0 3.3 3.3h9.4a3.3 3.3 0 0 0 3.3-3.3v-4.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M19.5 27.5h4.7a3.3 3.3 0 0 0 3.3-3.3v-9.4a3.3 3.3 0 0 0-3.3-3.3h-9.4a3.3 3.3 0 0 0-3.3 3.3v4.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="m9 9 3.5-3.5L9 2m14 21-3.5 3.5L23 30"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="hero-brand__word">SwapSkills</span>
        </Link>

        <nav className="hero-nav__links" aria-label="Main navigation">
          <Link style={{ "--i": 2 }} to="/login">
            Discover
          </Link>
          <a style={{ "--i": 3 }} href="#skill-match">
            How it Works
          </a>
          <Link style={{ "--i": 4 }} to="/register">
            Community
          </Link>
          <a style={{ "--i": 5 }} href="#no-payment">
            Pricing
          </a>
        </nav>

        <Link
          className={`btn-dark hero-nav__desktop-cta${isOpen ? " is-menu-open" : ""}`}
          to="/register"
          style={{ "--i": 6 }}
        >
          Get Started <ArrowUpRight size={16} />
        </Link>

        <button
          className={`hero-menu-toggle${isOpen ? " is-open" : ""}`}
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <nav
        id="mobile-navigation"
        className={`hero-mobile-panel${isOpen ? " is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <Link style={{ "--i": 2 }} to="/login" onClick={closeMenu}>
          Discover <ArrowUpRight size={18} />
        </Link>
        <a style={{ "--i": 3 }} href="#skill-match" onClick={closeMenu}>
          How it Works <ArrowUpRight size={18} />
        </a>
        <Link style={{ "--i": 4 }} to="/register" onClick={closeMenu}>
          Community <ArrowUpRight size={18} />
        </Link>
        <a style={{ "--i": 5 }} href="#no-payment" onClick={closeMenu}>
          Pricing <ArrowUpRight size={18} />
        </a>
        <Link
          className="btn-dark hero-nav__mobile-cta"
          to="/register"
          onClick={closeMenu}
        >
          Get Started <ArrowRight size={17} />
        </Link>
      </nav>

      <main className="hero-content">
        <div className="hero-badge" style={{ "--i": 7 }}>
          <span className="badge__tag">New</span>
          <span>500+ skills being traded today</span>
        </div>
        <h1 className="hero-title" style={{ "--i": 8 }}>
          The skill you have
          <br className="brk" /> is someone&apos;s next lesson.
        </h1>
        <p className="hero-subcopy" style={{ "--i": 9 }}>
          List what you can teach, find what you want to learn, and swap
          directly with real people.
          <br className="brk" />
          <span id="no-payment">
            No payment required — just knowledge for knowledge.
          </span>
        </p>

        <form
          id="skill-match"
          className="skill-match"
          onSubmit={handleFindMatch}
        >
          <div className="skill-match__fields">
            <label
              className="skill-match__pill skill-match__pill--teach"
              style={{ "--i": 10 }}
            >
              <span>TEACH</span>
              <input
                name="teach"
                placeholder="I can teach..."
                aria-label="A skill you can teach"
              />
            </label>
            <label
              className="skill-match__pill skill-match__pill--learn"
              style={{ "--i": 11 }}
            >
              <span>LEARN</span>
              <input
                name="learn"
                placeholder="I want to learn..."
                aria-label="A skill you want to learn"
              />
            </label>
          </div>
          <button
            className="skill-match__submit"
            type="submit"
            style={{ "--i": 12 }}
          >
            Find My Match <ArrowRight size={18} />
          </button>
        </form>

        <div className="hero-proof" aria-label="Community activity">
          <span className="hero-proof__avatars" aria-hidden="true">
            <i>M</i>
            <i>A</i>
            <i>J</i>
          </span>
          <span>Curious minds, sharing what they know</span>
        </div>
      </main>
    </section>
  );
};
