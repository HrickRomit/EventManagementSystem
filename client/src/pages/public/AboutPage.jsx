import Navbar from "../../components/navigation/Navbar";
import groupImage from "../../components/images/Group.jpg";
import rikImage from "../../components/images/Rik.JPG";
import yoshikiImage from "../../components/images/Yoshiki.png";
import sababImage from "../../components/images/Sabab.jpg";

const teamMembers = [
  {
    name: "Hrick Romit Barai",
    id: "2322136642",
    role: "Developer",
    image: rikImage,
    facebook: "https://www.facebook.com/hrick.romit.2024",
    instagram: "https://www.instagram.com/hrick_romit/",
  },
  {
    name: "Yoshiki Zaman",
    id: "2311806042",
    role: "Developer",
    image: yoshikiImage,
    facebook: "https://www.facebook.com/z0shii03",
    instagram: "https://www.instagram.com/_z0shii/",
  },
  {
    name: "Adib Araf Sabab",
    id: "2322163042",
    role: "Developer & Tester",
    image: sababImage,
    facebook: "https://www.facebook.com/Adib.Araf.Sabab",
    instagram: "https://www.instagram.com/adib._.araf._.sabab/",
  },
];

function AboutPage() {
  return (
    <main className="home-page">
      <Navbar />

      <section className="hero-panel about-hero">
        <h1>Discover the World's Top Event Planning Platform.</h1>
        <p className="hero-copy">
          We're on a mission to help professional organizers earn a living doing work they take pride in. Also a user friendly platform for attendees to find and attend events that they are interested in. We provide a comprehensive suite of tools and services to help event organizers create, manage, and promote their events with ease. Our platform offers features such as event registration, ticketing, marketing, and analytics to ensure that every event is a success. Whether you're planning a small gathering or a large conference, our platform has everything you need to make your event unforgettable.
        </p>
      </section>

      <section className="about-story-section" aria-labelledby="about-story-title">
        <div className="about-image-placeholder">
          <img src={groupImage} alt="The EventSphere creators" />
        </div>

        <div className="about-story-copy">
          <p className="hero-kicker">About EventSphere</p>
          <h2 id="about-story-title">Our story</h2>
          <p>
            EventSphere was created with a simple goal — to make event management easier, smarter, and more organized. We noticed that many events still relied on manual registrations, paper tickets, and scattered communication, which often caused confusion and delays.
            To solve this, we built a modern platform where organizers can manage events smoothly and participants can register, purchase tickets, and attend events with ease. By combining secure authentication, online ticketing, and QR-based check-ins, EventSphere delivers a seamless event experience for everyone.
            What began as a university project quickly became a passion for building real-world solutions through technology.
          </p>
        </div>
      </section>

      <section className="about-team-section" aria-labelledby="about-team-title">
        <div className="about-team-heading">
          <p className="hero-kicker">MEET THE TEAM</p>
          <h2 id="about-team-title">The People Behind EventSphere</h2>
        </div>

        <div className="about-team-grid">
          {teamMembers.map((member) => (
            <article className="about-team-card" key={member.name}>
              <img src={member.image} alt={member.name} />
              <div className="about-team-card-body">
                <h3>{member.name}</h3>
                <p>
                  <span>ID</span>
                  {member.id}
                </p>
                <p>
                  <span>Role</span>
                  {member.role}
                </p>
                <ul className="about-social-list" aria-label={`${member.name} social links`}>
                  <li>
                    <span>Facebook</span>
                    {member.facebook}
                  </li>
                  <li>
                    <span>Instagram</span>
                    {member.instagram}
                  </li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
