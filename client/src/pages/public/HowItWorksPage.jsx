import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navigation/Navbar";

const walkthroughs = {
  participant: {
    label: "Join an event",
    eyebrow: "Participant path",
    title: "Register for an event in a few guided clicks.",
    summary:
      "See how a participant creates an account, finds an event, chooses tickets, checks out, and receives their registration.",
    accent: "participant",
    cta: { label: "Browse Events", to: "/events" },
    secondaryCta: { label: "Create Account", to: "/register" },
    steps: [
      {
        title: "Create your participant account",
        copy:
          "Sign up as a participant so EventSphere can save your tickets, checkout history, and event access.",
        target: "Account role",
        screenTitle: "Create your account",
        screenMeta: "Participant selected",
        highlight: "role",
      },
      {
        title: "Browse active events",
        copy:
          "Open Events, compare categories, then inspect the active event cards for dates, venues, and starting prices.",
        target: "Events tab",
        screenTitle: "Upcoming events",
        screenMeta: "Concert Night - BDT 750",
        highlight: "event",
      },
      {
        title: "Pick a ticket tier",
        copy:
          "Choose the ticket category that fits you. The event detail panel shows availability before you add anything to cart.",
        target: "Ticket tier",
        screenTitle: "Select ticket",
        screenMeta: "Regular - BDT 750 - 42 left",
        highlight: "ticket",
      },
      {
        title: "Checkout and confirm",
        copy:
          "Review your cart, continue to payment, and return to EventSphere once payment succeeds.",
        target: "Checkout",
        screenTitle: "Checkout",
        screenMeta: "1 ticket - BDT 750",
        highlight: "checkout",
      },
      {
        title: "Use your registration",
        copy:
          "Your participant dashboard keeps the ticket ID and QR code ready for check-in on event day.",
        target: "My registrations",
        screenTitle: "Registration ready",
        screenMeta: "Ticket ID: EVT-2026-104",
        highlight: "qr",
      },
    ],
  },
  organizer: {
    label: "Host an event",
    eyebrow: "Organizer path",
    title: "Publish and manage an event from setup to check-in.",
    summary:
      "Walk through organizer registration, event creation, ticket setup, attendee tracking, and QR check-in.",
    accent: "organizer",
    cta: { label: "Start Hosting", to: "/register" },
    secondaryCta: { label: "Organizer Login", to: "/login" },
    steps: [
      {
        title: "Register as an organizer",
        copy:
          "Choose the organizer role during signup to unlock the event workspace and management tools.",
        target: "Organizer role",
        screenTitle: "Create your account",
        screenMeta: "Organizer selected",
        highlight: "role",
      },
      {
        title: "Create the event profile",
        copy:
          "Add the event name, date, venue, image, capacity, contact details, and category so guests know what to expect.",
        target: "Event details",
        screenTitle: "New event",
        screenMeta: "Tech Summit 2026",
        highlight: "form",
      },
      {
        title: "Set access and tickets",
        copy:
          "Decide whether the event is free, paid, or approval-based, then add ticket categories and availability.",
        target: "Ticket setup",
        screenTitle: "Ticket categories",
        screenMeta: "VIP - Regular - Student",
        highlight: "ticket",
      },
      {
        title: "Track registrations",
        copy:
          "After publishing, use the organizer dashboard to watch bookings, attendee lists, and event status.",
        target: "Registrations",
        screenTitle: "Registration report",
        screenMeta: "128 confirmed attendees",
        highlight: "report",
      },
      {
        title: "Check guests in",
        copy:
          "On event day, open Check-In and scan attendee QR codes to validate registrations quickly.",
        target: "QR check-in",
        screenTitle: "Check-in scanner",
        screenMeta: "Ready to scan",
        highlight: "scanner",
      },
    ],
  },
};

function HowItWorksPage() {
  const [activePath, setActivePath] = useState("participant");
  const [activeStep, setActiveStep] = useState(0);
  const walkthrough = walkthroughs[activePath];
  const currentStep = walkthrough.steps[activeStep];
  const progress = useMemo(
    () => ((activeStep + 1) / walkthrough.steps.length) * 100,
    [activeStep, walkthrough.steps.length],
  );

  const selectPath = (path) => {
    setActivePath(path);
    setActiveStep(0);
  };

  const goToNextStep = () => {
    setActiveStep((step) => Math.min(step + 1, walkthrough.steps.length - 1));
  };

  const goToPreviousStep = () => {
    setActiveStep((step) => Math.max(step - 1, 0));
  };

  return (
    <main className="home-page">
      <Navbar />

      <section className="hero-panel how-works-hero">
        <p className="hero-kicker">How it works</p>
        <h1>Learn the event journey before you start.</h1>
        <p className="hero-copy">
          Pick a path and move through a guided demo of the exact steps participants and
          organizers use inside EventSphere.
        </p>

        <div className="walkthrough-toggle" aria-label="Choose walkthrough type">
          {Object.entries(walkthroughs).map(([key, path]) => (
            <button
              key={key}
              type="button"
              className={`walkthrough-toggle-button ${activePath === key ? "walkthrough-toggle-active" : ""}`}
              onClick={() => selectPath(key)}
            >
              <span>{path.eyebrow}</span>
              {path.label}
            </button>
          ))}
        </div>
      </section>

      <section className={`walkthrough-shell walkthrough-${walkthrough.accent}`}>
        <div className="walkthrough-copy-panel">
          <p className="hero-kicker">{walkthrough.eyebrow}</p>
          <h2>{walkthrough.title}</h2>
          <p>{walkthrough.summary}</p>

          <div className="walkthrough-progress" aria-label={`Step ${activeStep + 1} of ${walkthrough.steps.length}`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="walkthrough-step-card">
            <span className="walkthrough-step-count">
              Step {activeStep + 1} of {walkthrough.steps.length}
            </span>
            <h3>{currentStep.title}</h3>
            <p>{currentStep.copy}</p>
          </div>

          <div className="walkthrough-controls">
            <button
              type="button"
              className="nav-button nav-button-secondary"
              onClick={goToPreviousStep}
              disabled={activeStep === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="nav-button nav-button-primary"
              onClick={goToNextStep}
              disabled={activeStep === walkthrough.steps.length - 1}
            >
              Next step
            </button>
          </div>

          <div className="walkthrough-cta-row">
            <Link className="nav-button nav-button-primary" to={walkthrough.cta.to}>
              {walkthrough.cta.label}
            </Link>
            <Link className="nav-button nav-button-secondary" to={walkthrough.secondaryCta.to}>
              {walkthrough.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="walkthrough-demo" aria-live="polite">
          <div className="walkthrough-demo-topbar">
            <span />
            <span />
            <span />
          </div>

          <div className="walkthrough-demo-screen">
            <div className="walkthrough-demo-sidebar">
              {walkthrough.steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  className={activeStep === index ? "walkthrough-nav-dot walkthrough-nav-dot-active" : "walkthrough-nav-dot"}
                  onClick={() => setActiveStep(index)}
                  aria-label={`Go to ${step.title}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="walkthrough-demo-content">
              <div className="walkthrough-demo-heading">
                <span>{currentStep.target}</span>
                <h3>{currentStep.screenTitle}</h3>
                <p>{currentStep.screenMeta}</p>
              </div>

              <div className="walkthrough-mock-grid">
                <div className={`mock-item mock-role ${currentStep.highlight === "role" ? "mock-item-active" : ""}`}>
                  <span>Role</span>
                  <strong>{activePath === "participant" ? "Participant" : "Organizer"}</strong>
                </div>
                <div className={`mock-item mock-event ${currentStep.highlight === "event" || currentStep.highlight === "form" ? "mock-item-active" : ""}`}>
                  <span>{activePath === "participant" ? "Event" : "Details"}</span>
                  <strong>{activePath === "participant" ? "Concert Night" : "Tech Summit"}</strong>
                </div>
                <div className={`mock-item mock-ticket ${currentStep.highlight === "ticket" ? "mock-item-active" : ""}`}>
                  <span>Tickets</span>
                  <strong>{activePath === "participant" ? "Regular x1" : "3 tiers"}</strong>
                </div>
                <div className={`mock-item mock-checkout ${currentStep.highlight === "checkout" || currentStep.highlight === "report" ? "mock-item-active" : ""}`}>
                  <span>{activePath === "participant" ? "Payment" : "Report"}</span>
                  <strong>{activePath === "participant" ? "Ready" : "Live"}</strong>
                </div>
                <div className={`mock-item mock-qr ${currentStep.highlight === "qr" || currentStep.highlight === "scanner" ? "mock-item-active" : ""}`}>
                  <span>{activePath === "participant" ? "QR ticket" : "Scanner"}</span>
                  <strong>{activePath === "participant" ? "Issued" : "Open"}</strong>
                </div>
              </div>

              <div className="walkthrough-callout">
                <span>Focus</span>
                <strong>{currentStep.target}</strong>
                <p>{currentStep.copy}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HowItWorksPage;
