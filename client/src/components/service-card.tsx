import { Shield, MessageCircle, QrCode, User, FileText, CreditCard, Monitor, IdCard } from "lucide-react";

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
};

interface ServiceCardProps {
  service: Service;
  onClick?: (service: Service) => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Shield;

  return (
    <div
      className="bg-beaver-surface hover:bg-beaver-surface-light border border-beaver-surface-light rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] hover:border-beaver-orange cursor-pointer group"
      onClick={() => onClick?.(service)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-beaver-orange bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
          <IconComponent className="text-beaver-orange w-6 h-6" />
        </div>
        <span className="text-xs bg-beaver-surface-light px-2 py-1 rounded text-gray-400">
          {service.port}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-beaver-orange mb-2">{service.name}</h3>
      <p className="text-gray-400 text-sm">{service.description}</p>
    </div>
  );
}
