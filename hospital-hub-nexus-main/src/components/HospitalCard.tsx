import { useState } from "react";
import { Star, MapPin, Phone, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface HospitalCardProps {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  phoneNumber: string;
  isOpen: boolean;
  distance: string; // Keep for sorting, but don't display
  services: string[];
  onDirectionsClick?: () => void;
  lat?: number;
  lon?: number;
  isCached?: boolean
}

// Convert decimal coordinates to DMS (Degrees, Minutes, Seconds) format
const convertToDMS = (coordinate: number, isLatitude: boolean): string => {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  const direction = isLatitude
    ? coordinate >= 0
      ? "N"
      : "S"
    : coordinate >= 0
    ? "E"
    : "W";

  return `${degrees}°${minutes}'${seconds}"${direction}`;
};

const HospitalCard = ({
  id,
  name,
  address,
  imageUrl,
  phoneNumber,
  isOpen,
  services,
  onDirectionsClick,
  isCached=false,
  lat,
  lon,
}: HospitalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mapsLinks = {
      '1': 'https://maps.app.goo.gl/wRtt8Suvg3L87i6P9',
      '2': 'https://maps.app.goo.gl/acrr7Brwf1HSCynR9',
      '3': 'https://maps.app.goo.gl/r9ZNW38ffGwXvd7aA'
    };
    window.open(mapsLinks[id], '_blank');
  };

  // Format coordinates in DMS format if available
  const formattedLocation =
    lat && lon
      ? `${convertToDMS(lat, true)} ${convertToDMS(lon, false)}`
      : "Coordinates not available";

  return (
    <div
      className={cn(
        "glass-card overflow-hidden card-hover h-full flex flex-col",
        isHovered ? "shadow-xl -translate-y-1" : "shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isCached && (
        <div className="absolute top-0 right-0 z-10 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-bl-lg">
          Cached
        </div>
      )}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{
            backgroundImage: `url(${imageUrl})`,
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <h3 className="text-white font-semibold text-xl">{name}</h3>
          </div>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <MapPin
            size={16}
            className="text-muted-foreground mt-1 flex-shrink-0"
          />
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Phone size={16} className="text-muted-foreground flex-shrink-0" />
          <p className="text-sm font-medium">
            {phoneNumber || "Not available"}
          </p>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Clock size={16} className="flex-shrink-0" />
          <span
            className={
              isOpen
                ? "text-green-600 text-sm font-medium"
                : "text-red-500 text-sm font-medium"
            }
          >
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>

        {/* <div className="flex items-start gap-3 mb-4">
          <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
          <p className="text-xs text-muted-foreground break-all">
            {formattedLocation}
          </p>
        </div> */}

        <div className="space-y-3 flex-grow">
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

        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={handleDirectionsClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            <Navigation size={16} />
            View Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;
