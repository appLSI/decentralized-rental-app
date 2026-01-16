// src/features/auth/components/AuthCarousel.tsx
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";

const heroImages = [
    {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "Reimagining",
        subtitle: "rental ownership.",
        description: "Join the decentralized revolution. Secure, transparent, and built for the modern tenant.",
    },
    {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
        title: "Your home,",
        subtitle: "your investment.",
        description: "Discover properties that match your lifestyle and financial goals.",
    },
    {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
        title: "Modern living",
        subtitle: "made simple.",
        description: "Experience seamless property management with cutting-edge technology.",
    },
];

// Shared state outside component to persist across route changes
let sharedCurrentSlide = 0;
let sharedTimer: NodeJS.Timeout | null = null;

export const AuthCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(sharedCurrentSlide);

    useEffect(() => {
        // Clear any existing timer
        if (sharedTimer) {
            clearInterval(sharedTimer);
        }

        // Start new timer
        sharedTimer = setInterval(() => {
            sharedCurrentSlide = (sharedCurrentSlide + 1) % heroImages.length;
            setCurrentSlide(sharedCurrentSlide);
        }, 5000);

        return () => {
            if (sharedTimer) {
                clearInterval(sharedTimer);
            }
        };
    }, []);

    const handleSlideChange = (index: number) => {
        sharedCurrentSlide = index;
        setCurrentSlide(index);
    };

    return (
        <div className="hidden lg:block lg:w-[58%] relative h-full overflow-hidden z-0">
            {heroImages.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        src={slide.url}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                </div>
            ))}

            <div className="absolute bottom-0 left-0 p-12 w-full z-10">
                <div className="flex items-center gap-3 text-white mb-6">
                    <Logo size="lg" className="text-primary-cyan-light" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    {heroImages[currentSlide].title} <br /> {heroImages[currentSlide].subtitle}
                </h1>
                <p className="text-gray-300 text-lg max-w-md">
                    {heroImages[currentSlide].description}
                </p>
                <div className="mt-8 flex gap-2">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleSlideChange(index)}
                            className={`h-1 rounded-full transition-all ${index === currentSlide
                                ? "w-12 bg-primary-cyan-light"
                                : "w-4 bg-gray-600 hover:bg-gray-500"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
