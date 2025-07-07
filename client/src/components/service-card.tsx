import { Shield, MessageCircle, QrCode, User, FileText, CreditCard, Monitor, IdCard, Cat } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  port: string;
  icon: string;
}

const iconMap = {
  shield: Shield,
  chat: MessageCircle,
  scan: QrCode,
  person: User,
  doc: FileText,
  pay: CreditCard,
  monitor: Monitor,
  id: IdCard,
  cat: Cat,
};

interface ServiceCardProps {
  service: Service;
  onClick?: (service: Service) => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Shield;

  return (
    <div
      className="bg-beaver-surface hover:bg-beaver-surface-light border border-beaver-surface-light rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:border-beaver-orange cursor-pointer group"
      onClick={() => onClick?.(service)}
    >
      <div className="flex items-center gap-4">
        {/* Icon on the left - 120x120 */}
        <div className="w-30 h-30 bg-beaver-orange/20 rounded-lg flex items-center justify-center group-hover:bg-beaver-orange/30 transition-all flex-shrink-0">
          <IconComponent className="text-beaver-orange w-16 h-16" />
        </div>
        
        {/* Text content on the right */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-beaver-orange truncate">{service.name}</h3>
            <span className="text-xs bg-beaver-surface-light px-2 py-1 rounded text-gray-400 ml-2 flex-shrink-0">
              {service.port}
            </span>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2">{service.description}</p>
        </div>
      </div>
    </div>
  );
}
