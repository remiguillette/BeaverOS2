import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import beaverImage from "@assets/beaver_1751858605395.png";

interface ServiceHeaderProps {
  serviceName: string;
  serviceIcon: LucideIcon;
  actionButton?: React.ReactNode;
  userName?: string;
}

export function ServiceHeader({ 
  serviceName, 
  serviceIcon: ServiceIcon, 
  actionButton,
  userName 
}: ServiceHeaderProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleBackToServices = () => {
    setLocation("/dashboard");
  };

  return (
    <header className="bg-beaver-surface border-b border-beaver-surface-light">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-beaver-orange">
              <img src={beaverImage} alt="Beaver" className="w-6 h-6 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-beaver-orange">BEAVERNET</h1>
            <div className="hidden sm:block text-gray-400">|</div>
            <div className="flex items-center space-x-2">
              <ServiceIcon className="w-5 h-5 text-beaver-orange" />
              <span className="text-lg font-semibold text-white">{serviceName}</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 hidden sm:inline">{userName || user?.name}</span>
            {actionButton}
            <Button
              onClick={handleBackToServices}
              variant="ghost"
              className="bg-beaver-surface-light hover:bg-gray-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Services</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}