
import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Star } from 'lucide-react';
import HospitalCard from '@/components/HospitalCard';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

// Sample hospital data
const allHospitals = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Healthcare Blvd, Medical District, NY 10001',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
    phoneNumber: '+1 (555) 123-4567',
    isOpen: true,
    distance: '1.2 miles',
    services: ['Emergency', 'Surgery', 'Cardiology', 'Pediatrics']
  },
  {
    id: '2',
    name: 'Riverside Medical Center',
    address: '456 Wellness Ave, Riverfront, NY 10002',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop',
    phoneNumber: '+1 (555) 234-5678',
    isOpen: true,
    distance: '2.5 miles',
    services: ['Emergency', 'Neurology', 'Orthopedics']
  },
  {
    id: '3',
    name: 'Parkview Health Institute',
    address: '789 Park Lane, Green District, NY 10003',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop',
    phoneNumber: '+1 (555) 345-6789',
    isOpen: false,
    distance: '3.8 miles',
    services: ['Oncology', 'Radiology', 'Laboratory']
  },
  {
    id: '4',
    name: 'Memorial Healthcare',
    address: '101 Memorial Drive, Downtown, NY 10004',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?q=80&w=2070&auto=format&fit=crop',
    phoneNumber: '+1 (555) 456-7890',
    isOpen: true,
    distance: '1.5 miles',
    services: ['Emergency', 'Gastroenterology', 'Urology']
  },
  {
    id: '5',
    name: 'University Medical Center',
    address: '202 University Blvd, Education District, NY 10005',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1581362072978-214c6244d722?q=80&w=2070&auto=format&fit=crop',
    phoneNumber: '+1 (555) 567-8901',
    isOpen: true,
    distance: '4.2 miles',
    services: ['Research', 'Cardiology', 'Neurosurgery', 'Transplant']
  },
  {
    id: '6',
    name: 'Eastside Medical Pavilion',
    address: '303 Eastside Ave, Eastside, NY 10006',
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
    phoneNumber: '+1 (555) 678-9012',
    isOpen: false,
    distance: '5.7 miles',
    services: ['Orthopedics', 'Physical Therapy', 'Sports Medicine']
  },
  {
    id: '7',
    name: 'Children\'s Health Center',
    address: '404 Children\'s Way, Family District, NY 10007',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop',
    phoneNumber: '+1 (555) 789-0123',
    isOpen: true,
    distance: '3.1 miles',
    services: ['Pediatrics', 'Child Psychology', 'Neonatology']
  },
  {
    id: '8',
    name: 'Wellness Community Hospital',
    address: '505 Wellness Blvd, Westside, NY 10008',
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?q=80&w=2070&auto=format&fit=crop',
    phoneNumber: '+1 (555) 890-1234',
    isOpen: true,
    distance: '2.8 miles',
    services: ['Primary Care', 'Family Medicine', 'Community Health']
  },
  {
    id: '9',
    name: 'Northside Regional Hospital',
    address: '606 North St, Northside, NY 10009',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop',
    phoneNumber: '+1 (555) 901-2345',
    isOpen: true,
    distance: '6.3 miles',
    services: ['Emergency', 'Surgery', 'Intensive Care']
  }
];

const serviceOptions = ['Emergency', 'Surgery', 'Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Oncology', 'Radiology', 'Laboratory', 'Primary Care'];

const Hospitals = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialLocation = searchParams.get('location') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialLocation);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [filteredHospitals, setFilteredHospitals] = useState(allHospitals);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort hospitals
  useEffect(() => {
    let result = [...allHospitals];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(hospital => 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply service filter
    if (selectedServices.length > 0) {
      result = result.filter(hospital => 
        selectedServices.some(service => hospital.services.includes(service))
      );
    }
    
    // Apply open only filter
    if (openOnly) {
      result = result.filter(hospital => hospital.isOpen);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });
    
    setFilteredHospitals(result);
  }, [searchTerm, selectedServices, openOnly, sortBy]);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 
            className={cn(
              "text-4xl md:text-5xl font-display font-bold mb-4 transition-all duration-700",
              isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            {searchTerm ? `Hospitals near ${searchTerm}` : 'Find Hospitals'}
          </h1>
          <p 
            className={cn(
              "text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100",
              isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Discover healthcare facilities near you with comprehensive services and expert medical care.
          </p>
        </div>
        
        <div 
          className={cn(
            "mb-8 transition-all duration-700 delay-200",
            isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search by location..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary rounded-lg transition-colors hover:bg-secondary/80"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            <select
              className="px-5 py-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
          
          {/* Filter Panel */}
          <div 
            className={cn(
              "bg-white border border-border rounded-lg p-5 mt-4 transition-all duration-300",
              isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden py-0 border-transparent"
            )}
          >
            <h3 className="font-medium mb-3">Filter by Services</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {serviceOptions.map(service => (
                <button
                  key={service}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors",
                    selectedServices.includes(service)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  onClick={() => toggleService(service)}
                >
                  {service}
                </button>
              ))}
            </div>
            
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={() => setOpenOnly(!openOnly)}
                  className="rounded border-input"
                />
                <span className="text-sm">Show only open hospitals</span>
              </label>
              
              <button
                className="text-sm text-primary"
                onClick={() => {
                  setSelectedServices([]);
                  setOpenOnly(false);
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Info */}
        <div 
          className={cn(
            "flex justify-between items-center mb-6 transition-all duration-700 delay-300",
            isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
          )}
        >
          <p className="text-muted-foreground">
            Showing {filteredHospitals.length} {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'}
            {searchTerm ? ` near ${searchTerm}` : ''}
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-primary" />
              <span>Distance</span>
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500" />
              <span>Rating</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-green-500" />
              <span>Open/Closed</span>
            </span>
          </div>
        </div>
        
        {/* Hospital Cards */}
        <div 
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-400",
            isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
          )}
        >
          {filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => (
              <HospitalCard key={hospital.id} {...hospital} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="mb-4 text-muted-foreground">
                <Search size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-xl font-medium">No hospitals found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
              <button 
                className="btn-secondary mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedServices([]);
                  setOpenOnly(false);
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
