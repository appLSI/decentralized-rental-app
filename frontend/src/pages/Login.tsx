// src/pages/LandingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import {
  Building2,
  Shield,
  Coins,
  Lock,
  TrendingUp,
  CheckCircle2,
  Users,
  BarChart,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Utilize blockchain-powered smart contracts for tamper-proof rental agreements. Every transaction is recorded on an immutable ledger, ensuring trust and security for all parties involved.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: Coins,
      title: "Crypto Payments",
      description: "Pay or receive rent in cryptocurrencies like Bitcoin, Ethereum, or stablecoins. Enjoy instant settlements and low transaction fees, making global payments seamless and efficient.",
      image: "https://images.unsplash.com/photo-1620336655055-bd87c3e8d8f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: Lock,
      title: "Smart Escrow",
      description: "Automate deposit management with secure smart contracts. Funds are held securely and released only when rental conditions are met, minimizing disputes and building trust.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: TrendingUp,
      title: "Property Tokenization",
      description: "Invest in real estate through fractional ownership. Tokenize properties to buy, sell, or trade shares, enabling accessible and liquid real estate investments.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: Users,
      title: "Community Governance",
      description: "Join a decentralized community where token holders can propose and vote on platform upgrades, ensuring RentChain evolves with user needs and priorities.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Gain insights with a powerful dashboard offering real-time data on rental performance, market trends, and investment opportunities, tailored for landlords and investors.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ];

  const stats = [
    { value: "$2.5B+", label: "Total Value Locked in Smart Contracts" },
    { value: "50K+", label: "Properties Listed Globally" },
    { value: "200K+", label: "Active Users and Investors" },
    { value: "99.9%", label: "Platform Uptime and Reliability" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-md z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-wide">
              RentChain
            </span>
          </div>
          <div className="flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-indigo-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-indigo-400 transition-colors"
            >
              How It Works
            </a>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-colors"
            >
              Connect
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 bg-gradient-to-b from-gray-900 to-indigo-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-gray-800/50 px-6 py-3 rounded-full mb-10 text-lg">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span className="font-semibold text-gray-200">
              Blockchain-Powered Real Estate
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-8 leading-tight">
            Transform Real Estate with
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              RentChain
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            RentChain revolutionizes real estate rentals and investments using
            blockchain technology. Enjoy secure, transparent, and automated
            solutions for property management, payments, and fractional
            ownership in a global marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="border border-indigo-400 text-indigo-400 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-400 hover:text-white transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
              style={{
                animation: `fadeIn 0.5s ease-in-out ${index * 0.2}s both`,
              }}
            >
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              <div className="text-base text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Why RentChain Stands Out
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              RentChain combines cutting-edge blockchain technology with real
              estate expertise to deliver a secure, transparent, and efficient
              platform for landlords, tenants, and investors worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-2xl p-6 hover:bg-gray-800 hover:scale-105 transition-all duration-300 group"
                style={{
                  animation: `fadeIn 0.5s ease-in-out ${index * 0.2}s both`,
                }}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-6 bg-[url('https://images.unsplash.com/photo-1497366210544-2b7424e90da3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center relative"
      >
        <div className="absolute inset-0 bg-gray-900/80"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              How RentChain Works
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From listing properties to managing rentals and investments,
              RentChain streamrains the entire process with blockchain-powered
              solutions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-800 hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full inline-flex mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">List Your Property</h3>
              <p className="text-gray-400 text-sm">
                Create and list your property with smart contract-based
                agreements. Ensure transparency and security for all rental
                transactions.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-800 hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full inline-flex mb-4">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-gray-400 text-sm">
                Accept instant crypto payments with automated escrow services,
                ensuring funds are released only when conditions are met.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-800 hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full inline-flex mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Invest & Grow</h3>
              <p className="text-gray-400 text-sm">
                Tokenize properties for fractional ownership, enabling investors
                to buy, sell, and trade shares in real estate markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-gray-900/80"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Join the Real Estate Revolution
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            RentChain empowers landlords, tenants, and investors with a secure,
            transparent, and efficient platform for real estate rentals and
            investments. Start today and be part of the future.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Join RentChain Now
            <CheckCircle2 className="inline ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">RentChain</span>
          </div>
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <a
                href="#features"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                How It Works
              </a>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <a
                href="#"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                Documentation
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                FAQ
              </a>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <a
                href="#"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                Privacy Policy
              </a>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <a
                href="#"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                Contact Us
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-indigo-400 mb-2"
              >
                Support
              </a>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            &copy; 2025 RentChain. All rights reserved. Powered by blockchain
            technology.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* CSS Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default LandingPage;