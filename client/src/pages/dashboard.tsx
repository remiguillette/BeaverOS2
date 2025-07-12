import { DivisionCard } from "@/components/division-card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { EnhancedHeader } from "@/components/enhanced-header";
import { useTranslation } from "react-i18next";

const getDivisions = (t: (key: string) => string) => [
  {
    id: "publicsafety",
    name: t('division.publicsafety'),
    description: t('division.publicsafety_desc'),
    route: "/publicsafety",
    icon: "shield",
    services: [
      {
        id: "beaverpatch",
        name: t('service.beaverpatch'),
        description: t('service.beaverpatch_desc'),
        port: ":5001",
        icon: "shield",
      },
      {
        id: "beaverpaws",
        name: t('service.beaverpaws'),
        description: t('service.beaverpaws_desc'),
        port: ":5001",
        icon: "cat",
      },
      {
        id: "beaverdmv",
        name: t('service.beaverdmv'),
        description: t('service.beaverdmv_desc'),
        port: ":5010",
        icon: "id",
      },
      {
        id: "beavermap",
        name: t('service.beavermap'),
        description: t('service.beavermap_desc'),
        port: ":5011",
        icon: "map",
      },
      {
        id: "beaverEmergency",
        name: t('service.beaverEmergency'),
        description: t('service.beaverEmergency_desc'),
        port: ":5012",
        icon: "emergency",
      },
    ]
  },
  {
    id: "ohs",
    name: t('division.ohs'),
    description: t('division.ohs_desc'),
    route: "/OHS",
    icon: "shield",
    services: [
      {
        id: "beaverisk",
        name: t('service.beaverisk'),
        description: t('service.beaverisk_desc'),
        port: ":5008",
        icon: "shield",
      },
      {
        id: "beaveraudit",
        name: t('service.beaveraudit'),
        description: t('service.beaveraudit_desc'),
        port: ":5009",
        icon: "audit",
      },
    ]
  },
  {
    id: "datamanagement",
    name: t('division.datamanagement'),
    description: t('division.datamanagement_desc'),
    route: "/SQL",
    icon: "database",
    services: [
      {
        id: "beavercrm",
        name: t('service.beavercrm'),
        description: t('service.beavercrm_desc'),
        port: ":5002",
        icon: "person",
      },
      {
        id: "beaverdoc",
        name: t('service.beaverdoc'),
        description: t('service.beaverdoc_desc'),
        port: ":5005",
        icon: "doc",
      },
      {
        id: "beaverSQL",
        name: t('service.beaverSQL'),
        description: t('service.beaverSQL_desc'),
        port: ":5013",
        icon: "database",
      },
    ]
  },
  {
    id: "tool",
    name: t('division.tool'),
    description: t('division.tool_desc'),
    route: "/tool",
    icon: "wrench",
    services: [
      {
        id: "beavermonitor",
        name: t('service.beavermonitor'),
        description: t('service.beavermonitor_desc'),
        port: ":5007",
        icon: "monitor",
      },
      {
        id: "beaverpay",
        name: t('service.beaverpay'),
        description: t('service.beaverpay_desc'),
        port: ":5006",
        icon: "pay",
      },
    ]
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleDivisionClick = (division: any) => {
    console.log("Navigate to division:", division.id);
    setLocation(division.route);
  };

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
      // For new/not implemented services
      console.log(`Service ${service.name} ${t('dashboard.notImplemented')}`);
    }
  };

  const divisions = getDivisions(t);

  return (
    <div className="min-h-screen bg-beaver-dark">
      <EnhancedHeader />

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-beaver-orange mb-2">{t('dashboard.divisions')}</h2>
        </div>

        {/* Divisions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {divisions.map((division) => (
            <DivisionCard
              key={division.id}
              division={division}
              onClick={handleDivisionClick}
              onServiceClick={handleServiceClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
