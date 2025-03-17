import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Star, Loader, AlertTriangle, Database, WifiOff } from 'lucide-react';
import HospitalCard from '@/components/HospitalCard';
import RecentSearches from '@/components/RecentSearches.tsx';
import NetworkStatus from '@/components/NetworkStatus.tsx';
import { saveHospitals, getHospitalsByPincode, isOnline } from '@/lib/indexedDB';
import { cn } from '@/lib/utils';
import { useLocation, useSearchParams } from 'react-router-dom';

interface Hospital {
  id: string;
  name: string;
  address: string;
  rating: number;
  imageUrl: string;
  phoneNumber: string;
  isOpen: boolean;
  distance: string;
  services: string[];
  lat: number;
  lon: number;
}

// Common hospital services for categorization - Including Indian healthcare categories
const serviceOptions = [
  'Emergency',
  'Surgery',
  'Cardiology',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
  'Oncology',
  'Radiology',
  'Laboratory',
  'Primary Care',
  'Ayurvedic',
  'Homeopathic',
  'Alternative Medicine',
  'Wellness',
  'Physiotherapy'
];

// Default hospital images by type - Using images representing Indian hospitals and healthcare facilities
const defaultImages = [
  'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?q=80&w=2070&auto=format&fit=crop', // Modern hospital
  'https://images.unsplash.com/photo-1629909615216-206bbc9fe55f?q=80&w=2069&auto=format&fit=crop', // Hospital building
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop', // Hospital entrance
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop', // Hospital exterior
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2828&auto=format&fit=crop', // Indian healthcare
  'https://images.unsplash.com/photo-1629909614088-d32d19a60766?q=80&w=1974&auto=format&fit=crop', // Hospital reception
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop', // Hospital building
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop'  // Healthcare facility
];

const Hospitals = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialLocation = searchParams.get('location') || '';

  const [searchTerm, setSearchTerm] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState(initialLocation); // For pincode search
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hospitalNameSearch, setHospitalNameSearch] = useState('');

  const [offline, setOffline] = useState(!navigator.onLine);
  const [usingCachedData, setUsingCachedData] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const location = searchParams.get('location');
    if (location) {
      setSearchTerm(location);
      searchHospitals(location);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isValidIndianPincode = (pincode: string): boolean => {
    return /^[1-9][0-9]{5}$/.test(pincode);
  };

  const searchHospitals = async (pincode: string) => {
    if (!pincode.trim()) return;

    if (!isValidIndianPincode(pincode)) {
      setError("Please enter a valid Indian pincode (6 digits)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUsingCachedData(false);

    try {
      const cachedHospitals = await getHospitalsByPincode(pincode);

      if (!navigator.onLine) {
        if (cachedHospitals.length > 0) {
          setHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
          setFilteredHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
          setSearchQuery(pincode);
          setUsingCachedData(true);
          setIsLoading(false);
          return;
        } else {
          setError("You're offline and no cached data is available for this pincode. Please connect to the internet and try again.");
          setIsLoading(false);
          return;
        }
      }

      // Add a 1 second delay to show loading screen
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // OpenStreetMap Nominatim API to get coordinates from pincode
        // Add country=india parameter to restrict to India
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=india&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );

        if (!nominatimResponse.ok) {
          throw new Error('Failed to fetch location data');
        }

        const nominatimData = await nominatimResponse.json();

        if (!nominatimData.length) {
          // If online request fails but we have cached data, use it
          if (cachedHospitals.length > 0) {
            setHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
            setFilteredHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
            setSearchQuery(pincode);
            setUsingCachedData(true);
            setIsLoading(false);
            return;
          }

          setError("Couldn't find location in India. Please check the pincode.");
          setHospitals([]);
          setFilteredHospitals([]);
          setIsLoading(false);
          return;
        }

        const { lat, lon, display_name } = nominatimData[0];

        // Ensure the location is in India
        if (!display_name.toLowerCase().includes('india')) {
          // If online request fails but we have cached data, use it
          if (cachedHospitals.length > 0) {
            setHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
            setFilteredHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
            setSearchQuery(pincode);
            setUsingCachedData(true);
            setIsLoading(false);
            return;
          }

          setError("This location appears to be outside India. Please enter an Indian pincode.");
          setHospitals([]);
          setFilteredHospitals([]);
          setIsLoading(false);
          return;
        }

        // Use Overpass API to query for hospitals in the area
        const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${lat},${lon});
          way["amenity"="hospital"](around:5000,${lat},${lon});
          relation["amenity"="hospital"](around:5000,${lat},${lon});
          node["amenity"="clinic"](around:5000,${lat},${lon});
          way["amenity"="clinic"](around:5000,${lat},${lon});
          relation["amenity"="clinic"](around:5000,${lat},${lon});
          node["healthcare"](around:5000,${lat},${lon});
          way["healthcare"](around:5000,${lat},${lon});
          relation["healthcare"](around:5000,${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;

        const overpassResponse = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
        );

        if (!overpassResponse.ok) {
          throw new Error('Failed to fetch hospital data');
        }

        const overpassData = await overpassResponse.json();

        if (!overpassData.elements || overpassData.elements.length === 0) {
          // If online request fails but we have cached data, use it
          if (cachedHospitals.length > 0) {
            setHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
            setFilteredHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
            setSearchQuery(pincode);
            setUsingCachedData(true);
            setIsLoading(false);
            return;
          }

          setError("No hospitals found in this pincode area. Try a different pincode in India.");
          setHospitals([]);
          setFilteredHospitals([]);
          setIsLoading(false);
          return;
        }

        // Process hospital data
        const foundHospitals: Hospital[] = overpassData.elements
          .filter((element: any) => {
            // More strict filtering to ensure we only get actual hospitals
            if (!element.tags) return false;

            // Skip entries without coordinates
            if (!element.lat || !element.lon) return false;

            // Check if it's explicitly a hospital or medical facility
            const isHospital =
              element.tags.amenity === 'hospital' ||
              element.tags.healthcare === 'hospital';

            // Check if it's a clinic or medical center
            const isClinic =
              element.tags.amenity === 'clinic' ||
              element.tags.healthcare === 'clinic' ||
              element.tags.healthcare === 'centre' ||
              element.tags.healthcare === 'center';

            // Exclude specific types that aren't hospitals
            const isExcluded =
              element.tags.amenity === 'pharmacy' ||
              element.tags.amenity === 'doctors' ||
              element.tags.healthcare === 'pharmacy' ||
              element.tags.healthcare === 'blood_donation' ||
              element.tags.healthcare === 'laboratory' ||
              element.tags.healthcare === 'sample_collection' ||
              element.tags.healthcare === 'blood_bank' ||
              element.tags.name?.toLowerCase().includes('pharmacy') ||
              element.tags.name?.toLowerCase().includes('medical store') ||
              element.tags.name?.toLowerCase().includes('diagnostic') ||
              element.tags.name?.toLowerCase().includes('lab') ||
              element.tags.name?.toLowerCase().includes('laboratory');

            // Check name for hospital keywords
            const nameHasHospitalKeyword =
              element.tags.name && (
                element.tags.name.toLowerCase().includes('hospital') ||
                element.tags.name.toLowerCase().includes('medical center') ||
                element.tags.name.toLowerCase().includes('medical centre') ||
                element.tags.name.toLowerCase().includes('nursing home') ||
                element.tags.name.toLowerCase().includes('healthcare')
              );

            return (isHospital || isClinic || nameHasHospitalKeyword) && !isExcluded;
          })
          .map((element: any, index: number) => {
            // Calculate distance (crow flies)
            const hospitalLat = element.lat || 0;
            const hospitalLon = element.lon || 0;
            const distance = calculateDistance(
              parseFloat(lat),
              parseFloat(lon),
              hospitalLat,
              hospitalLon
            );

            // Determine services based on tags
            const services: string[] = [];
            if (element.tags.emergency === 'yes') services.push('Emergency');
            if (element.tags.healthcare === 'doctor') services.push('Primary Care');
            if (element.tags.healthcare === 'hospital') services.push('Surgery');
            if (element.tags.healthcare === 'clinic') services.push('Primary Care');

            // Add Indian healthcare types
            if (element.tags.healthcare === 'ayurvedic') services.push('Ayurvedic');
            if (element.tags.healthcare === 'homeopathic') services.push('Homeopathic');
            if (element.tags.healthcare === 'unani' || element.tags.healthcare === 'siddha') services.push('Alternative Medicine');
            if (element.tags.healthcare === 'physiotherapist') services.push('Physiotherapy');
            if (element.tags.healthcare === 'yoga') services.push('Wellness');

            // Add specialty if available
            if (element.tags.healthcare_speciality) {
              const specialties = element.tags.healthcare_speciality.split(';');
              for (const specialty of specialties) {
                const mappedSpecialty = mapSpecialtyToService(specialty.trim());
                if (mappedSpecialty && !services.includes(mappedSpecialty)) {
                  services.push(mappedSpecialty);
                }
              }
            }

            // If no services were identified, add some default ones
            if (services.length === 0) {
              services.push('Primary Care');

              // Add random services for demo purposes
              const randomServices = serviceOptions
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 3) + 1);

              for (const service of randomServices) {
                if (!services.includes(service)) {
                  services.push(service);
                }
              }
            }

            // Determine open status (random for demo since actual opening hours might not be available)
            const isOpen = Math.random() > 0.3; // 70% chance of being open

            // Get name or fallback
            const name = element.tags.name ||
              element.tags["name:en"] ||
              (element.tags.amenity === 'hospital' ? 'Hospital' : 'Medical Clinic');

            // Get address or construct from available data
            const address = element.tags["addr:full"] ||
              constructAddress(element.tags) ||
              `Near ${display_name}`;

            // Helper function to format Indian phone numbers
            const formatIndianPhoneNumber = (phone: string | null): string => {
              if (!phone) return "Not available";

              // If already formatted or contains spaces, return as is
              if (phone.includes(" ")) {
                return phone;
              }

              // Clean the number and keep only digits
              const digits = phone.replace(/\D/g, '');

              // Format phone number without adding country code
              if (digits.length >= 8 && digits.length <= 12) {
                // For telephone numbers or mobile numbers without country code
                return digits.length > 10
                  ? `${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -5)} ${digits.slice(-5)}`
                  : `${digits.slice(0, digits.length - 5)} ${digits.slice(-5)}`;
              }

              // Return original if can't format
              return phone;
            };

            // Get phone number or fallback
            const phoneNumber = formatIndianPhoneNumber(
              element.tags.phone ||
              element.tags["contact:phone"] ||
              null
            );

            // Pick an image for the hospital
            const imageUrl = defaultImages[index % defaultImages.length];

            // Comment out rating generation
            // const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

            return {
              id: element.id.toString(),
              name,
              address,
              rating: 0, // Set to 0 since we're not using ratings
              imageUrl,
              phoneNumber,
              isOpen,
              distance: `${distance.toFixed(1)} km`,
              services,
              lat: hospitalLat,
              lon: hospitalLon,
              isCached: false
            };
          });

        // Save to IndexedDB for offline use
        await saveHospitals(pincode, foundHospitals);

        setHospitals(foundHospitals);
        setFilteredHospitals(foundHospitals);
        setSearchQuery(pincode); // Update the display term
      } catch (err) {
        console.error('Error fetching hospital data:', err);

        if (cachedHospitals.length > 0) {
          setHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
          setFilteredHospitals(cachedHospitals.map(h => ({ ...h, isCached: true })));
          setSearchQuery(pincode);
          setUsingCachedData(true);
          setIsLoading(false);
          return;
        }

        setError("Failed to fetch hospital data. Please try again.");
        setHospitals([]);
        setFilteredHospitals([]);
      }
    }
    catch (err) {
      console.error('Error in searchHospitals:', err);
      setError("An unexpected error occurred. Please try again.");
      setHospitals([]);
      setFilteredHospitals([]);
    }
    finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Convert degrees to radians
    const toRad = (value: number) => value * Math.PI / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  // Helper function to construct address from OSM tags
  const constructAddress = (tags: any): string => {
    const parts = [];

    if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
    if (tags["addr:street"]) parts.push(tags["addr:street"]);
    if (tags["addr:city"]) parts.push(tags["addr:city"]);
    if (tags["addr:state"]) parts.push(tags["addr:state"]);
    if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);

    return parts.length > 0 ? parts.join(', ') : '';
  };

  // Helper function to map healthcare specialties to service categories
  const mapSpecialtyToService = (specialty: string): string | null => {
    const specialtyMap: { [key: string]: string } = {
      'cardiology': 'Cardiology',
      'heart': 'Cardiology',
      'cardiac': 'Cardiology',
      'pediatrics': 'Pediatrics',
      'children': 'Pediatrics',
      'neurology': 'Neurology',
      'brain': 'Neurology',
      'orthopaedics': 'Orthopedics',
      'orthopedics': 'Orthopedics',
      'bone': 'Orthopedics',
      'oncology': 'Oncology',
      'cancer': 'Oncology',
      'radiology': 'Radiology',
      'xray': 'Radiology',
      'laboratory': 'Laboratory',
      'lab': 'Laboratory',
      'surgery': 'Surgery',
      'emergency': 'Emergency',
      // Add some common Indian healthcare terms
      'ayurvedic': 'Ayurvedic',
      'ayurveda': 'Ayurvedic',
      'homeopathic': 'Homeopathic',
      'homeopathy': 'Homeopathic',
      'unani': 'Alternative Medicine',
      'siddha': 'Alternative Medicine',
      'yoga': 'Wellness',
      'physiotherapy': 'Physiotherapy'
    };

    const lowerSpecialty = specialty.toLowerCase();

    for (const [key, value] of Object.entries(specialtyMap)) {
      if (lowerSpecialty.includes(key)) {
        return value;
      }
    }

    return null;
  };

  // Function to open location in Google Maps
  const openDirections = (hospital: Hospital) => {
    // Use exact coordinates for location
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`;

    // Open in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filter and sort hospitals
  useEffect(() => {
    let result = [...hospitals];

    // Apply hospital name search if more than 20 hospitals in result
    if (hospitalNameSearch && hospitals.length > 20) {
      result = result.filter(hospital =>
        hospital.name.toLowerCase().includes(hospitalNameSearch.toLowerCase())
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
      }
      return 0;
    });

    setFilteredHospitals(result);
  }, [hospitals, selectedServices, openOnly, sortBy, hospitalNameSearch]);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchHospitals(searchTerm);
  };

  // Example Indian pincodes for major cities
  const examplePincodes = [
    { code: '110001', city: 'Delhi' },
    { code: '400001', city: 'Mumbai' },
    { code: '700001', city: 'Kolkata' },
    { code: '600001', city: 'Chennai' },
    { code: '500001', city: 'Hyderabad' },
    { code: '560001', city: 'Bangalore' }
  ];

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
            {searchQuery ? `Hospitals near ${searchQuery}` : 'Find Hospitals in India'}
          </h1>
          <p
            className={cn(
              "text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100",
              isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Discover healthcare facilities across India with comprehensive services and expert medical care.
          </p>

          {/* Offline indicator */}
          {offline && (
            <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-4 py-2 mt-4 inline-flex items-center gap-2">
              <WifiOff size={16} />
              <span>You're offline. Limited functionality available.</span>
            </div>
          )}

          {/* Cached data indicator */}
          {usingCachedData && (
            <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-lg px-4 py-2 mt-4 inline-flex items-center gap-2">
              <Database size={16} />
              <span>Using cached data from previous search.</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "mb-8 transition-all duration-700 delay-200",
            isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
          )}
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Enter Indian pincode (e.g., 110001)..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg transition-colors hover:bg-primary/90 disabled:opacity-70"
              disabled={isLoading || !searchTerm.trim()}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Search</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary rounded-lg transition-colors hover:bg-secondary/80"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            {/* <select
              className="px-5 py-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Sort by Distance</option>
            </select> */}
          </form>

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
                  type="button"
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
                type="button"
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

        {/* Recent searches section - only show when we haven't searched yet */}
        {hospitals.length === 0 && !isLoading && !error && (
          <RecentSearches
            onSelectPincode={(pincode) => {
              setSearchTerm(pincode);
              searchHospitals(pincode);
            }}
            className="mt-6"
          />
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-16">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Searching for hospitals...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="text-center py-12">
          <div className="mb-4 text-red-500">
            <p className="text-xl font-medium">{error}</p>
          </div>
          <button
            className="btn-secondary mt-4"
            onClick={() => {
              searchHospitals(searchTerm);
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results display only when not loading and no errors */}
      {!isLoading && !error && (
        <>
          {/* Results Info */}
          {hospitals.length > 0 && (
            <div
              className={cn(
                "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 transition-all duration-700 delay-300 gap-4",
                isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
              )}
            >
              <p className="text-muted-foreground">
                Showing {filteredHospitals.length} {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'}
                {searchQuery ? ` near ${searchQuery}` : ''}
                {usingCachedData ? ' (from cache)' : ''}
              </p>

              {/* Hospital name search input for when there are many results */}
              {hospitals.length > 20 && (
                <div className="relative w-full md:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search hospital by name..."
                    className="pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full md:w-60"
                    value={hospitalNameSearch}
                    onChange={(e) => setHospitalNameSearch(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-green-500" />
                  <span>Open/Closed</span>
                </span>
              </div>
            </div>
          )}

          {/* No search yet state */}
          {hospitals.length === 0 && !searchQuery && (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
              <p className="text-xl font-medium mb-2">Enter an Indian pincode to find hospitals</p>
              <p className="text-muted-foreground">Search for hospitals in your area by entering your 6-digit pincode</p>

              <div className="mt-6 text-sm text-muted-foreground">
                <p className="mb-2">Example pincodes:</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {examplePincodes.map(example => (
                    <button
                      key={example.code}
                      onClick={() => {
                        setSearchTerm(example.code);
                        searchHospitals(example.code);
                      }}
                      className="px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                    >
                      {example.city} ({example.code})
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle size={16} />
                <span>Only Indian locations are supported</span>
              </div>
            </div>
          )}

          {/* No hospitals with filters */}
          {filteredHospitals.length === 0 && hospitals.length > 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="mb-4 text-muted-foreground">
                <Search size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-xl font-medium">No hospitals found with selected filters</p>
                <p className="text-muted-foreground">Try adjusting your search filters or try a different pincode</p>
              </div>
              <button
                className="btn-secondary mt-4"
                onClick={() => {
                  setSelectedServices([]);
                  setOpenOnly(false);
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Hospital Cards */}
          {hospitals.length > 0 && filteredHospitals.length > 0 && (
            <div
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-400",
                isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
              )}
            >
              {filteredHospitals.map((hospital) => (
                <div key={hospital.id} className="h-full">
                  <HospitalCard
                    {...hospital}
                    onDirectionsClick={() => openDirections(hospital)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    // </div>
  );
};

export default Hospitals;
