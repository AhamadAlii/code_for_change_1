
import { useEffect, useState } from 'react';
import { Heart, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BloodTypeStatus {
  type: string;
  status: 'low' | 'medium' | 'high';
  quantity: number;
}

interface BloodBankStatusProps {
  bloodBankName: string;
  lastUpdated: string;
  bloodTypes: BloodTypeStatus[];
}

const BloodBankStatus = ({
  bloodBankName,
  lastUpdated,
  bloodTypes
}: BloodBankStatusProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'high':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'low':
        return 'Critical';
      case 'medium':
        return 'Moderate';
      case 'high':
        return 'Sufficient';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className={cn(
        "glass-card p-5 transition-all duration-500",
        isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{bloodBankName}</h3>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
        <Heart size={24} className="text-red-500" />
      </div>

      <div className="space-y-4">
        {bloodTypes.some(blood => blood.status === 'low') && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500" />
            <p className="text-sm text-red-700">
              Urgent need for blood donations, especially types marked as critical.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {bloodTypes.map((blood, index) => (
            <div 
              key={index} 
              className={cn(
                "relative p-4 rounded-lg border transition-all",
                blood.status === 'low' ? "border-red-200 bg-red-50" : "border-border"
              )}
            >
              <div className="absolute top-3 right-3">
                <span className={cn(
                  "inline-block w-2 h-2 rounded-full animate-pulse-subtle",
                  getStatusColor(blood.status)
                )}></span>
              </div>

              <div className="mb-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{blood.type}</span>
                <span className="text-xs text-muted-foreground">{blood.status === 'low' && '(needed)'}</span>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      getStatusColor(blood.status)
                    )}
                    style={{ 
                      width: blood.status === 'low' ? '15%' : blood.status === 'medium' ? '50%' : '85%'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">
                    {getStatusText(blood.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {blood.quantity} units
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-border flex justify-center">
        <button className="btn-primary">Donate Blood</button>
      </div>
    </div>
  );
};

export default BloodBankStatus;
