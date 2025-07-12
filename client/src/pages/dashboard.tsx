import { ServiceCard } from "@/components/service-card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { EnhancedHeader } from "@/components/enhanced-header";
import { useTranslation } from "@/hooks/use-translation";

const getServices = (t: (key: string) => string) => [
  {
    id: "beaverpatch",
    name: t('service.beaverpatch'),
    description: t('service.beaverpatch.desc'),
    port: ":5001",
    icon: "shield",
  },
  {
    id: "beaverpaws",
    name: t('service.beaverpaws'),
    description: t('service.beaverpaws.desc'),
    port: ":5001",
    icon: "cat",
  },
  {
    id: "beavercrm",
    name: t('service.beavercrm'),
    description: t('service.beavercrm.desc'),
    port: ":5002",
    icon: "person",
  },
  {
    id: "beaverdoc",
    name: t('service.beaverdoc'),
    description: t('service.beaverdoc.desc'),
    port: ":5005",
    icon: "doc",
  },
  {
    id: "beaverpay",
    name: t('service.beaverpay'),
    description: t('service.beaverpay.desc'),
    port: ":5006",
    icon: "pay",
  },
  {
    id: "beavermonitor",
    name: t('service.beavermonitor'),
    description: t('service.beavermonitor.desc'),
    port: ":5007",
    icon: "monitor",
  },
  {
    id: "beaverdmv",
    name: t('service.beaverdmv'),
    description: t('service.beaverdmv.desc'),
    port: ":5010",
    icon: "id",
  },
  {
    id: "beaverisk",
    name: t('service.beaverisk'),
    description: t('service.beaverisk.desc'),
    port: ":5008",
    icon: "shield",
  },
  {
    id: "beaveraudit",
    name: t('service.beaveraudit'),
    description: t('service.beaveraudit.desc'),
    port: ":5009",
    icon: "audit",
  },

];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

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
    } else if (service.id === "beaverdmv") {
      setLocation("/BeaverDMV");

    } else {
      // For other services, you can add their routes here
      console.log(`Service ${service.name} ${t('dashboard.notImplemented')}`);
    }
  };

  const services = getServices(t);

  return (
    <div className="min-h-screen bg-beaver-dark">
      <EnhancedHeader />

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-beaver-orange mb-2">{t('dashboard.services')}</h2>
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
