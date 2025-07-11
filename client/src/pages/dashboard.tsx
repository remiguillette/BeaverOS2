import { LogOut, Languages, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/service-card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import beaverImage from "@assets/beaver_1751858605395.png";

const services = [
  {
    id: "beaverpatch",
    name: "BeaverPatch",
    description: "CAD system",
    port: ":5001",
    icon: "shield",
  },
  {
    id: "beaverpaws",
    name: "BeaverPaws",
    description: "Animal Controls",
    port: ":5001",
    icon: "cat",
  },
  {
    id: "beavercrm",
    name: "BeaverCRM",
    description: "Customer Management",
    port: ":5002",
    icon: "person",
  },

  {
    id: "beaverdoc",
    name: "BeaverDoc",
    description: "Legal Document Traceability",
    port: ":5005",
    icon: "doc",
  },
  {
    id: "beaverpay",
    name: "BeaverPay",
    description: "Système de paiement sécurisé",
    port: ":5006",
    icon: "pay",
  },
  {
    id: "beavermonitor",
    name: "BeaverMonitor",
    description: "Information",
    port: ":5007",
    icon: "monitor",
  },
  {
    id: "beaverdmv",
    name: "BeaverDMV",
    description: "Vérification du permis de conduire",
    port: "TBD",
    icon: "id",
  },
  {
    id: "beaverisk",
    name: "BeaverRisk",
    description: "Risk Assessment & Strategic Planning",
    port: ":5008",
    icon: "shield",
  },
  {
    id: "beaveraudit",
    name: "BeaverAudit",
    description: "Public Safety Audit & Compliance",
    port: ":5009",
    icon: "audit",
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const toggleLanguage = () => {
    setCurrentLang(currentLang === 'en' ? 'fr' : 'en');
  };

  // Animated gradient effect for buttons
  useEffect(() => {
    let angle = 0;
    let animationFrameId: number;

    const rotateGradient = () => {
      angle = (angle + 1) % 360;
      
      // Apply to all buttons with gradient effect
      const buttons = [languageButtonRef.current, profileButtonRef.current, loginButtonRef.current];
      buttons.forEach(button => {
        if (button) {
          button.style.setProperty("--gradient-angle", `${angle}deg`);
        }
      });
      
      animationFrameId = requestAnimationFrame(rotateGradient);
    };

    rotateGradient();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Logo animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleServiceClick = (service: any) => {
    console.log("Navigate to service:", service.id);
    // Navigate to specific service pages
    if (service.id === "beaverpatch") {
      setLocation("/BeaverPatch");
    } else if (service.id === "beaverpaws") {
      setLocation("/BeaverPaws");
    } else if (service.id === "beavercrm") {
      setLocation("/BeaverCRM");
    } else if (service.id === "beaverdoc") {
      setLocation("/BeaverDoc");
    } else if (service.id === "beaverpay") {
      setLocation("/BeaverPay");
    } else if (service.id === "beaverisk") {
      setLocation("/BeaverRisk");
    } else if (service.id === "beaveraudit") {
      setLocation("/BeaverAudit");
    } else {
      // For other services, you can add their routes here
      console.log(`Service ${service.name} not yet implemented`);
    }
  };

  return (
    <div className="min-h-screen bg-beaver-dark">
      {/* Enhanced Header Navigation */}
      <header className="bg-black w-full py-2 md:py-4 shadow-md" role="banner">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className={`w-10 h-10 md:w-12 lg:w-16 md:h-12 lg:h-16 bg-black rounded-lg flex items-center justify-center transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 scale-75'}`}>
                <img 
                  src={beaverImage} 
                  alt="BEAVERNET Logo" 
                  className="w-8 h-8 md:w-10 lg:w-14 md:h-10 lg:h-14 object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className={`text-[#f89422] text-lg md:text-2xl lg:text-4xl font-bold transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-x-[-20px]'}`}>
                    BEAVERNET
                  </span>
                </div>
              </div>
            </div>

            {/* User Menu with Enhanced Buttons */}
            <nav className="flex items-center space-x-2 md:space-x-6" role="navigation">
              <span className="text-beaver-orange hidden md:block whitespace-nowrap">
                Welcome, {user?.name}
              </span>
              
              {/* Language Toggle Button */}
              <button
                ref={languageButtonRef}
                onClick={toggleLanguage}
                className="border-gradient-button flex items-center justify-center px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm"
                aria-label={currentLang === 'en' ? 'Switch to French' : 'Switch to English'}
              >
                <Languages className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-[#f89422]" />
                {currentLang === 'en' ? 'FR' : 'EN'}
              </button>

              {/* Profile Button */}
              <button
                ref={profileButtonRef}
                onClick={() => setLocation("/profile")}
                className="border-gradient-button flex items-center justify-center px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm"
                aria-label="View Profile"
              >
                <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-[#f89422]" />
                <span className="hidden sm:inline">Profile</span>
              </button>

              {/* Logout Button */}
              <button
                ref={loginButtonRef}
                onClick={handleLogout}
                className="border-gradient-button flex items-center justify-center px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm"
                aria-label="Logout"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-[#f89422]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-beaver-orange mb-2">Applications</h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={handleServiceClick}
            />
          ))}
        </div>


      </main>
    </div>
  );
}
