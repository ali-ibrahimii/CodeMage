import { Mail, Send } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Learning: [
      { name: 'Learning Paths', href: '/learning-paths' },
      { name: 'All Tutorials', href: '/tutorials' },
      { name: 'JavaScript', href: '/tutorials/javascript' },
      { name: 'React.js', href: '/tutorials/react' },
      { name: 'Next.js', href: '/tutorials/next' }
    ],
    Community: [
      { name: 'Forum', href: '#' },
      { name: 'Discord', href: '#' },
      { name: 'GitHub Discussions', href: '#' },
      { name: 'Twitter', href: '#' }
    ],
    Company: [
      { name: 'About Us', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Careers', href: '#' }
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' }
    ]
  };

  const socialLinks = [
    // { icon: Github, href: '#', label: 'GitHub' },
    // { icon: Twitter, href: '#', label: 'Twitter' },
    // { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' }
  ];

  return (
    <footer className="bg-background border-t border-border">
      {/* Newsletter Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Stay Updated</h3>
              <p className="text-muted-foreground">Get the latest tutorials, resources, and learning tips delivered to your inbox.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-foreground mb-4">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-6 sm:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">DT</span>
                </div>
                <span className="font-bold text-lg text-foreground">DevTutorials</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {currentYear} DevTutorials. All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg border border-border bg-card hover:bg-primary/10 hover:border-primary transition-all flex items-center justify-center group"
                    aria-label={social.label}
                  >
                    <Icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

