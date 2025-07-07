import { LogOut, Boxes, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceCard } from "@/components/service-card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
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
    id: "beaverlaw",
    name: "BeaverLaw",
    description: "Contrôles Animalier",
    port: ":5002",
    icon: "cat",
  },
  {
    id: "beaverscanner",
    name: "BeaverScanner",
    description: "Lecture automatisée de plaques d'immatriculation",
    port: ":5003",
    icon: "scan",
  },
  {
    id: "beavernetcrm",
    name: "BeavernetCRM",
    description: "Gestion des clients",
    port: ":5004",
    icon: "person",
  },
  {
    id: "beaverdoc",
    name: "BeaverDoc",
    description: "Surveillance des documents",
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
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleServiceClick = (service: any) => {
    console.log("Navigate to service:", service.id);
    // In a real application, this would navigate to the specific service
    // or open it in a new window/tab
  };

  return (
    <div className="min-h-screen bg-beaver-dark">
      {/* Header Navigation */}
      <header className="bg-beaver-surface border-b border-beaver-surface-light">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-beaver-orange">
                <img src={beaverImage} alt="Beaver" className="w-6 h-6 object-contain" />
              </div>
              <h1 className="text-xl font-bold text-beaver-orange">BEAVERNET</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden sm:inline">{user?.name}</span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="bg-beaver-surface-light hover:bg-gray-700 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
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

        {/* Stats Section */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Total Services</p>
                  <p className="text-xl sm:text-2xl font-bold text-beaver-orange">{services.length}</p>
                </div>
                <Boxes className="text-beaver-orange w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Active Connections</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">7</p>
                </div>
                <Zap className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-beaver-surface border-beaver-surface-light sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">System Status</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">Online</p>
                </div>
                <Activity className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
