import { useState, useEffect } from 'react';
import { ArrowRight, Search, MapPin, Hospital, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [location, setLocation] = useState('');
  const [searchType, setSearchType] = useState('hospitals');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleFindNow = () => {
    if (searchType === 'hospitals') {
      if (location.trim()) {
        navigate(`/hospitals?location=${encodeURIComponent(location)}`);
      } else {
        navigate('/hospitals');
      }
    } else if (searchType === 'blood-bank') {
      if (location.trim()) {
        navigate(`/blood-bank?pincode=${encodeURIComponent(location)}`);
      } else {
        navigate('/blood-bank');
      }
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

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
              "flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-300 max-w-2xl mx-auto",
              isLoaded ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            <div className="search-container w-full sm:w-auto sm:flex-1 relative shadow-lg rounded-2xl">
              <div className="flex flex-col sm:flex-row">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-primary/70" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter location or pincode..."
                    className="w-full h-14 pl-11 pr-4 py-3 rounded-t-xl sm:rounded-r-none sm:rounded-l-xl border-0 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFindNow();
                      }
                    }}
                  />
                </div>

                <div className="sm:w-[180px] w-full z-10">
                  <Select
                    defaultValue="hospitals"
                    onValueChange={setSearchType}
                    value={searchType}
                  >
                    <SelectTrigger className="w-full h-14 rounded-none sm:border-x border-y sm:border-y-0 border-0 bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-inner">
                      <SelectValue placeholder="Search for..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-lg overflow-hidden">
                      <SelectItem value="hospitals" className="flex items-center pl-8 gap-2 py-3 px-4 cursor-pointer hover:bg-primary/10 transition-colors">
                        <div className='ml-3 max-sm:ml-8 flex gap-2'>
                          <Hospital size={18} className="text-primary" />
                          <span className="font-medium">Hospitals</span></div>
                      </SelectItem>
                      <SelectItem value="blood-bank" className="flex items-center pl-8 gap-2 py-3 px-4 cursor-pointer hover:bg-red-50 transition-colors">
                        <div className='ml-3 max-sm:ml-8 flex gap-2'>
                          <Droplet size={18} className="text-red-500" />
                          <span className="font-medium">Blood Bank</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 max-sm:mt-5 transition-all duration-700 delay-300">
            <button
              className={cn("bg-primary text-white px-5 py-2 rounded-xl flex items-center gap-2 text-lg font-semibold shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg active:scale-95 w-auto",
                isLoaded ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
              )}
              onClick={handleFindNow}
            >
              <span>Find Now </span>
              <ArrowRight size={18} />
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