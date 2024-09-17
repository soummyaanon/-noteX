import React from "react";
import { MacbookScroll } from "../ui/macbook-scroll";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const SocialLink = ({ href, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="transform -rotate-12 hover:rotate-0 transition-transform"
  >
    <Icon className="h-8 w-8 text-white" />
  </a>
);

const Badge = () => (
  <div className="flex space-x-2">
    <SocialLink href="https://github.com/soummyaanon" icon={FaGithub} />
    <SocialLink href="https://www.linkedin.com/in/soumyapanda12/" icon={FaLinkedin} />
    <SocialLink href="https://x.com/Thesourya2000" icon={FaSquareXTwitter} />
  </div>
);

export function Feature() {
  return (
    <div className="overflow-hidden dark:bg-[#0B0B0F] bg-white w-full">
      <MacbookScroll
        title={
          <h2 className=" font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            AI-Enhanced Note-Taking Revolution
          </h2>
        }
        badge={<Badge />}
        src={[
          { src: "/Featurevid.webm", type: "video/webm" },
          { src: "/Featurevid.mkv", type: "video/mp4" }
        ]}
        showGradient={false}
        className="scale-[1.75] md:scale-150 lg:scale-[1.75]"
        isVideo={true}
      />
    </div>
  );
}

export default Feature;