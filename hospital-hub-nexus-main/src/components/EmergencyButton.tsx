
import { useState } from 'react';
import { PhoneCall, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const EmergencyButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEmergencyCall = () => {
    setIsCalling(true);
    
    // In a real app, you'd implement the actual emergency call functionality here
    setTimeout(() => {
      setIsCalling(false);
    }, 2000);
  };

  return (
    <>
      <button 
        onClick={toggleExpand}
        className={cn(
          "emergency-btn transition-all duration-300",
          isExpanded ? "bg-white" : "bg-destructive hover:scale-110 animate-pulse-subtle"
        )}
      >
        {isExpanded ? (
          <X size={24} className="text-destructive" />
        ) : (
          <PhoneCall size={24} className="text-white" />
        )}
      </button>

      <div 
        className={cn(
          "fixed z-40 bottom-8 right-8 transition-all duration-300 ease-in-out transform",
          isExpanded ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95 pointer-events-none"
        )}
        style={{ marginBottom: "5rem" }}
      >
        <div className="glass-card p-5 w-72 shadow-lg">
          <div className="text-center mb-4">
            <span className="inline-block p-3 bg-red-100 text-destructive rounded-full mb-2">
              <PhoneCall size={24} />
            </span>
            <h3 className="text-lg font-semibold">Emergency Services</h3>
            <p className="text-sm text-muted-foreground">
              Call for immediate medical assistance
            </p>
          </div>
          
          <button
            onClick={handleEmergencyCall}
            disabled={isCalling}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2",
              isCalling ? "bg-green-600" : "bg-destructive hover:bg-destructive/90 active:scale-95"
            )}
          >
            {isCalling ? (
              <>
                <span className="animate-pulse">Connecting...</span>
              </>
            ) : (
              <>
                <PhoneCall size={18} />
                <span>Call Emergency (911)</span>
              </>
            )}
          </button>
          
          <div className="mt-4 text-center">
            <button 
              onClick={toggleExpand}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronUp size={14} className="mr-1" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencyButton;
