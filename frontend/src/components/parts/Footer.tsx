import Container from "../ui/container";
import Logo from "../ui/logo";
import { Github, Instagram, Twitter, Linkedin, Globe } from "lucide-react";

const socialLinks = [
  {
    href: "https://kneerazzz.vercel.app",
    label: "Website",
    icon: Globe,
  },
  {
    href: "https://x.com/kneerazzz",
    label: "X (Twitter)",
    icon: Twitter,
  },
  {
    href: "https://github.com/kneerazzz",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://instagram.com/kneerazzz",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://linkedin.com/in/kneerazzz",
    label: "LinkedIn",
    icon: Linkedin,
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-black/80 backdrop-blur-md border-t border-white/10 text-white/80">
      <Container className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">

        {/* Logo + Socials */}
        <div className="flex flex-col gap-4 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1">
          <Logo />
          <p className="text-xs text-white/40 leading-relaxed">
            Create & share memes with the world.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-3 sm:gap-6">
          <h2 className="text-xs sm:text-sm font-semibold text-white">Features</h2>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <a href="/create" className="text-gray-700 hover:text-gray-50">Create Meme</a>
            <a href="/feed" className="text-gray-700 hover:text-gray-50">Feed</a>
            <a href="/feed/trending" className="text-gray-700 hover:text-gray-50">Trending</a>
            <a href="/feed/new" className="text-gray-700 hover:text-gray-50">Latest</a>
            <a href="/templates" className="text-gray-700 hover:text-gray-50">Templates</a>
            <a href="/explore" className="text-gray-700 hover:text-gray-50">Explore</a>
          </div>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-3 sm:gap-6">
          <h2 className="text-xs sm:text-sm font-semibold text-white">Product</h2>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <a href="/features" className="text-gray-700 hover:text-gray-50">Features</a>
            <a href="/upcoming" className="text-gray-700 hover:text-gray-50">Upcoming</a>
            <a href="/create/template" className="text-gray-700 hover:text-gray-50">Upload Template</a>
            <a href="/create/editor" className="text-gray-700 hover:text-gray-50">Editor</a>
          </div>
        </div>

        {/* Account */}
        <div className="flex flex-col gap-3 sm:gap-6">
          <h2 className="text-xs sm:text-sm font-semibold text-white">Account</h2>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <a href="/profile" className="text-gray-700 hover:text-gray-50">Profile</a>
            <a href="/settings/account" className="text-gray-700 hover:text-gray-50">Settings</a>
            <a href="/settings/password" className="text-gray-700 hover:text-gray-50">Password</a>
            <a href="/register" className="text-gray-700 hover:text-gray-50">Register</a>
          </div>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3 sm:gap-6">
          <h2 className="text-xs sm:text-sm font-semibold text-white">Resources</h2>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <a href="/" className="text-gray-700 hover:text-gray-50">Home</a>
            <a href="/features" className="text-gray-700 hover:text-gray-50">Features</a>
            <a href="/upcoming" className="text-gray-700 hover:text-gray-50">What&apos;s New</a>
            <a href="/explore" className="text-gray-700 hover:text-gray-50">Explore</a>
          </div>
        </div>

        {/* Connect */}
        <div className="flex flex-col gap-3 sm:gap-6">
          <h2 className="text-xs sm:text-sm font-semibold text-white">Connect</h2>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <a href="https://kneerazzz.vercel.app" className="text-gray-700 hover:text-gray-50">Contact us</a>
            <a href="https://instagram.com/kneerazzz" className="text-gray-700 hover:text-gray-50">Community</a>
            <a href="https://x.com/kneerazzz" className="text-gray-700 hover:text-gray-50">X (Twitter)</a>
            <a href="https://github.com/kneerazzz" className="text-gray-700 hover:text-gray-50">Github</a>
            <a href="https://instagram.com/kneerazzz" className="text-gray-700 hover:text-gray-50">Instagram</a>
            <a href="https://linkedin.com/in/kneerazzz" className="text-gray-700 hover:text-gray-50">Linkedin</a>
          </div>
        </div>

      </Container>

      {/* Bottom: Copyright */}
      <div className="text-center text-xs sm:text-sm text-white/40 pb-4 sm:pb-6">
        © {new Date().getFullYear()} Mimi. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;