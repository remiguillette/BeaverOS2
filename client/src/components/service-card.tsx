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
      className="bg-beaver-surface hover:bg-beaver-surface-light border border-beaver-surface-light rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] hover:border-beaver-orange cursor-pointer group min-h-[240px] w-full"
      onClick={() => onClick?.(service)}
    >
      <div className="flex items-start gap-6 h-full">
        {/* Icon on the left - 200x200 */}
        <div className="w-[200px] h-[200px] bg-beaver-orange/20 rounded-lg flex items-center justify-center group-hover:bg-beaver-orange/30 transition-all flex-shrink-0">
          <IconComponent className="text-beaver-orange w-24 h-24" />
        </div>
        
        {/* Text content on the right */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-[200px]">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-beaver-orange mb-2 break-words">{service.name}</h3>
            <p className="text-gray-400 text-base leading-relaxed break-words">{service.description}</p>
          </div>
          <div className="mt-auto">
            <span className="inline-block text-sm bg-beaver-surface-light px-3 py-2 rounded text-gray-400">
              Port: {service.port}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
