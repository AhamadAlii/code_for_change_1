
import { useState } from 'react';
import { Star, MapPin, Phone, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HospitalCardProps {
  id: string;
  name: string;
  address: string;
  rating: number;
  imageUrl: string;
  phoneNumber: string;
  isOpen: boolean;
  distance: string;
  services: string[];
}

const HospitalCard = ({
  id,
  name,
  address,
  rating,
  imageUrl,
  phoneNumber,
  isOpen,
  distance,
  services
}: HospitalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "glass-card overflow-hidden card-hover",
        isHovered ? "shadow-xl -translate-y-1" : "shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{ 
            backgroundImage: `url(${imageUrl})`,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <div className="px-2 py-1 bg-white/90 text-foreground text-xs font-medium rounded-full inline-flex items-center gap-1 mb-2">
              <MapPin size={12} className="text-primary" />
              <span>{distance} away</span>
            </div>
            <h3 className="text-white font-semibold text-xl">{name}</h3>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/90 text-foreground rounded-full">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <MapPin size={16} className="text-muted-foreground mt-1 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <Phone size={16} className="text-muted-foreground flex-shrink-0" />
          <p className="text-sm">{phoneNumber}</p>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <Clock size={16} className="flex-shrink-0" />
          <span className={isOpen ? "text-green-600 text-sm font-medium" : "text-red-500 text-sm font-medium"}>
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Available Services:</h4>
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span 
                key={index}
                className="text-xs bg-secondary px-2 py-1 rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex justify-between">
          <button className="text-primary text-sm font-medium hover:underline">
            View Details
          </button>
          <button className="text-sm font-medium hover:text-primary transition-colors">
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;
