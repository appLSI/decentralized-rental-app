import { Twitter, Facebook, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1b2e3f] border-t border-[#2d4458]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-[#edbf6d] flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-[#1b2e3f]">R</span>
              </div>
              <span className="text-2xl font-bold text-[#edbf6d] tracking-tight">
                RentChain
              </span>
            </div>
            <p className="text-gray-300 max-w-md text-sm leading-relaxed">
              Revolutionizing property rentals through blockchain technology.
              Experience secure, transparent, and efficient rental transactions
              with the power of decentralized finance.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-[#edbf6d] transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#edbf6d] transition-colors duration-200"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#edbf6d] transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#edbf6d] transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-[#edbf6d] font-semibold text-lg">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/browse"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  Browse Properties
                </a>
              </li>
              <li>
                <a
                  href="/my-properties"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  My Properties
                </a>
              </li>
              <li>
                <a
                  href="/add-property"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  Add Property
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-[#edbf6d] font-semibold text-lg">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/privacy"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/cookie-policy"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-[#edbf6d] transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2d4458] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} RentChain. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>Built with ❤️ for the future of rentals</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
