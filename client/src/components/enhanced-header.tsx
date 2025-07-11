import { LogOut, Languages, User, LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import beaverImage from "@assets/beaver_1751858605395.png";

interface EnhancedHeaderProps {
  serviceName?: string;
  serviceIcon?: LucideIcon;
  actionButton?: React.ReactNode;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonAction?: () => void;
}

export function EnhancedHeader({ 
  serviceName, 
  serviceIcon: ServiceIcon, 
  actionButton,
  showBackButton = false,
  backButtonText = "Back to Dashboard",
  backButtonAction
}: EnhancedHeaderProps) {
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

  const handleBackAction = () => {
    if (backButtonAction) {
      backButtonAction();
    } else {
      setLocation("/dashboard");
    }
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

  return (
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
                {serviceName && (
                  <>
                    <span className="text-gray-400 text-lg md:text-2xl lg:text-4xl font-bold mx-2">|</span>
                    <div className="flex items-center space-x-2">
                      {ServiceIcon && (
                        <ServiceIcon className="w-6 h-6 md:w-8 md:h-8 text-[#f89422]" />
                      )}
                      <span className="text-white text-lg md:text-2xl lg:text-3xl font-bold">
                        {serviceName}
                      </span>
                    </div>
                  </>
                )}
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

            {/* Action Button (if provided) */}
            {actionButton}

            {/* Back Button (if needed) */}
            {showBackButton && (
              <button
                onClick={handleBackAction}
                className="border-gradient-button flex items-center justify-center px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm"
                aria-label={backButtonText}
              >
                <span className="hidden sm:inline">{backButtonText}</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              ref={loginButtonRef}
              onClick={handleLogout}
              className="border-gradient-button flex items-center justify-center px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm group"
              aria-label="Logout"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-[#f89422] transition-transform duration-300 group-hover:translate-x-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}