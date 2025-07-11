import { ServiceCard } from "@/components/service-card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { EnhancedHeader } from "@/components/enhanced-header";

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
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
      <EnhancedHeader />

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
