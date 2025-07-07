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
      className="bg-beaver-surface hover:bg-beaver-surface-light border border-beaver-surface-light rounded-xl p-4 sm:p-6 transition-all duration-200 hover:scale-[1.02] hover:border-beaver-orange cursor-pointer group w-full"
      onClick={() => onClick?.(service)}
    >
      {/* Mobile: Stack vertically */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 h-full min-h-[200px] sm:min-h-[180px]">
        {/* Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-beaver-orange/20 rounded-lg flex items-center justify-center group-hover:bg-beaver-orange/30 transition-all flex-shrink-0">
          <IconComponent className="text-beaver-orange w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14" />
        </div>
        
        {/* Text content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left">
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-beaver-orange mb-2 break-words">{service.name}</h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed break-words">{service.description}</p>
          </div>
          <div className="mt-auto">
            <span className="inline-block text-xs sm:text-sm bg-beaver-surface-light px-2 sm:px-3 py-1 sm:py-2 rounded text-gray-400">
              {(service.id === "beaverpatch" || service.id === "beaverlaw") ? "Click to Open" : `Port: ${service.port}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
