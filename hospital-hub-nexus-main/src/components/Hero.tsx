
import { useState, useEffect } from 'react';
import { ArrowRight, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFindNow = () => {
    if (location.trim()) {
      navigate(`/hospitals?location=${encodeURIComponent(location)}`);
    } else {
      // If no location is provided, just navigate to hospitals page
      navigate('/hospitals');
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent -z-10" />
      
      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-100/50 blur-3xl -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-indigo-100/40 blur-3xl -z-10 animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span 
            className={cn(
              "inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 transition-all duration-700",
              isLoaded ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Find Hospitals & Blood Banks Near You
          </span>
          
          <h1 
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 transition-all duration-700 delay-100",
              isLoaded ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Healthcare Information, <span className="text-primary">Simplified</span>
          </h1>
          
          <p 
            className={cn(
              "text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200",
              isLoaded ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Find nearby hospitals, check blood availability in real-time, and access crucial healthcare information all in one place.
          </p>
          
          <div 
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300",
              isLoaded ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Enter your location..."
                className="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFindNow();
                  }
                }}
              />
            </div>
            <button 
              className="btn-primary flex items-center gap-2 whitespace-nowrap w-full sm:w-auto"
              onClick={handleFindNow}
            >
              <span>Find Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div 
            className={cn(
              "mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground transition-all duration-700 delay-400",
              isLoaded ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>500+ Hospitals</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>24/7 Emergency Support</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Real-time Blood Availability</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
