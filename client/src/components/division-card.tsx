import { Shield, Users, Database, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Division {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  port: string;
  icon: string;
}

const iconMap = {
  shield: Shield,
  users: Users,
  database: Database,
  wrench: Wrench,
};

interface DivisionCardProps {
  division: Division;
  onClick?: (division: Division) => void;
  onServiceClick?: (service: Service) => void;
}

export function DivisionCard({ division, onClick, onServiceClick }: DivisionCardProps) {
  const IconComponent = iconMap[division.icon as keyof typeof iconMap] || Shield;
  const { t } = useTranslation();

  return (
    <div className="bg-beaver-surface border border-beaver-surface-light rounded-xl p-6 transition-all duration-200 hover:border-beaver-orange">
      {/* Division Header */}
      <div 
        className="flex items-center gap-4 mb-6 cursor-pointer group"
        onClick={() => onClick?.(division)}
      >
        <div className="w-16 h-16 bg-beaver-orange/20 rounded-lg flex items-center justify-center group-hover:bg-beaver-orange/30 transition-all">
          <IconComponent className="text-beaver-orange w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-beaver-orange mb-1">{division.name}</h3>
          <p className="text-gray-400 text-sm">{division.description}</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {division.services.map((service) => (
          <div
            key={service.id}
            className="bg-beaver-surface-light hover:bg-beaver-orange/10 border border-beaver-surface-light hover:border-beaver-orange/30 rounded-lg p-4 transition-all duration-200 cursor-pointer group"
            onClick={() => onServiceClick?.(service)}
          >
            <h4 className="text-beaver-orange font-medium mb-1 group-hover:text-beaver-orange">{service.name}</h4>
            <p className="text-gray-400 text-xs leading-relaxed">{service.description}</p>
            <span className="inline-block text-xs bg-beaver-surface px-2 py-1 rounded text-gray-500 mt-2">
              {t('dashboard.clickToOpen')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}