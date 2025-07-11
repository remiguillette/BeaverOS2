import { Link } from 'wouter';
import { useTranslation } from '../contexts/TranslationContext';
import { Languages } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import beaverLogo from '../assets/beaver.png';

export const Header = () => {
  const { language, changeLanguage, t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    console.log('🔄 Header language toggle clicked:', {
      currentLanguage: language,
      targetLanguage: newLang,
      component: 'Header'
    });
    changeLanguage(newLang);
  };

  useEffect(() => {
    if (!buttonRef.current) return;

    let angle = 0;
    let animationFrameId: number;

    const rotateGradient = () => {
      angle = (angle + 1) % 360;
      if (buttonRef.current) {
        buttonRef.current.style.setProperty("--gradient-angle", `${angle}deg`);
      }
      animationFrameId = requestAnimationFrame(rotateGradient);
    };

    rotateGradient();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    // Trigger logo animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="bg-black w-full py-2 md:py-4 shadow-md" role="banner">
      <div className="container-responsive flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 md:space-x-4" aria-label={language === 'fr' ? 'Accueil - Rémi Guillette Groupe' : 'Home - Rémi Guillette Group'}>
          <img 
            src={beaverLogo} 
            alt={language === 'fr' ? 'Logo Rémi Guillette Groupe' : 'Rémi Guillette Group Logo'} 
            className={`h-8 w-10 md:h-12 lg:h-50 md:w-12 lg:w-60 mr-1 md:mr-5 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 scale-75'}`}
            style={{ objectFit: "contain" }}
          />
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className={`text-[#0d6efd] text-lg md:text-2xl lg:text-4xl font-bold transition-all duration-700 ${isLoaded ? 'header-logo-remi' : 'opacity-0 translate-x-[-20px]'}`}>Rémi</span>
              <span className={`text-[#f89422] text-lg md:text-2xl lg:text-4xl font-bold transition-all duration-700 delay-200 ${isLoaded ? 'header-logo-guillette' : 'opacity-0 translate-x-[20px]'}`}>Guillette</span>
            </div>
            <p className={`text-[#f89422] text-sm md:text-lg lg:text-2xl font-bold whitespace-nowrap transition-all duration-700 delay-400 ${isLoaded ? 'header-logo-groupe' : 'opacity-0 translate-y-[10px]'}`}>Groupe</p>
            <p className={`text-[#f89422] text-sm md:text-lg lg:text-2xl font-bold whitespace-nowrap transition-all duration-700 delay-600 ${isLoaded ? 'header-logo-group' : 'opacity-0 translate-y-[10px]'}`}>Group</p>
          </div>
        </Link>

        {/* Ontario Pride Text & Language Toggle */}
        <nav className="flex items-center space-x-2 md:space-x-6" role="navigation" aria-label={language === 'fr' ? 'Menu principal' : 'Main menu'}>
          <span className="ontario-pride-text hidden md:block whitespace-nowrap">
            {language === 'fr' ? 'Fier de l\'Ontario' : 'Proud of Ontario'}
          </span>
          <button
            ref={buttonRef}
            onClick={toggleLanguage}
            className="border-gradient-button flex items-center justify-center text-white px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm"
            aria-label={language === 'fr' ? 'Changer la langue vers l\'anglais' : 'Change language to French'}
          >
            <Languages className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" aria-hidden="true" />
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
        </nav>
      </div>
    </header>
  );
};