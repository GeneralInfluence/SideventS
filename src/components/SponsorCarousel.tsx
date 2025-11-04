import React from "react";
import "../styles/SponsorCarousel.css";

const sponsors = [
  { name: "UnicornAI", logo: "🦄", url: "https://unicornai.example.com" },
  { name: "BlockBoost", logo: "🚀", url: "https://blockboost.example.com" },
  { name: "MetaMesh", logo: "🕸️", url: "https://metamesh.example.com" },
  { name: "ChainChill", logo: "❄️", url: "https://chainchill.example.com" },
  { name: "CryptoCafé", logo: "☕", url: "https://cryptocafe.example.com" },
  { name: "DeFiDazzle", logo: "✨", url: "https://defidazzle.example.com" },
  { name: "Web3Wizards", logo: "🧙", url: "https://web3wizards.example.com" },
  { name: "TokenTigers", logo: "🐯", url: "https://tokentigers.example.com" },
  { name: "NFTNest", logo: "🪺", url: "https://nftnest.example.com" },
  { name: "SmartSage", logo: "🦉", url: "https://smartsage.example.com" }
];

const SponsorCarousel: React.FC = () => {
  return (
    <div className="sponsor-carousel">
      <div className="carousel-track">
        {[...sponsors, ...sponsors].map((sponsor, idx) => (
          <a
            className="sponsor-item"
            key={idx}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit ${sponsor.name}`}
            style={{ textDecoration: "none" }}
          >
            <span className="sponsor-logo">{sponsor.logo}</span>
            <span className="sponsor-name">{sponsor.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SponsorCarousel;
