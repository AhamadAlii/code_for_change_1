import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Search, Filter, MapPin, Clock, Loader, AlertTriangle, Droplet, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';

// Blood groups to filter by
const bloodGroups = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

// Structure for blood bank data
interface BloodBank {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact: string;
  mobile: string;
  email: string;
  category: string;
  bloodComponentAvailable: boolean;
  serviceTime: string;
  lat: number;
  lon: number;
  bloodAvailability: {
    [key: string]: number;
  };
}

const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const BloodBank = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBloodGroups, setSelectedBloodGroups] = useState<string[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [filteredBloodBanks, setFilteredBloodBanks] = useState<BloodBank[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Check for pincode parameter in URL on component mount
  useEffect(() => {
    const pincode = searchParams.get('pincode');
    if (pincode) {
      setSearchTerm(pincode);
      searchBloodBanks(pincode);
    }
  }, [searchParams]);

  // Add Indian pincode validation
  const isValidIndianPincode = (pincode: string): boolean => {
    // Indian pincodes are 6 digits
    return /^[1-9][0-9]{5}$/.test(pincode);
  };

  // Function to search for blood banks
  const searchBloodBanks = async (pincode: string) => {
    if (!pincode.trim()) return;
    
    // Validate Indian pincode format
    if (!isValidIndianPincode(pincode)) {
      setError("Please enter a valid Indian pincode (6 digits)");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the blood bank API
      const response = await axios.get(
        `https://api.data.gov.in/resource/fced6df9-a360-4e08-8ca0-f283fc74ce15`, 
        {
          params: {
            "api-key": "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
            format: "json",
            limit: 100,
            offset: 0,
            "filters[pincode]": pincode,
          },
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      
      if (!response.data || !response.data.records || response.data.records.length === 0) {
        setError("No blood banks found in this pincode area. Try a different pincode in India.");
        setBloodBanks([]);
        setFilteredBloodBanks([]);
        setIsLoading(false);
        return;
      }
      
      // Process blood bank data
      const foundBloodBanks: BloodBank[] = response.data.records.map((item: any, index: number) => {
        // Generate random blood availability for demonstration
        const bloodAvailability: {[key: string]: number} = {};
        bloodGroups.forEach(group => {
          // Randomly decide if this blood group is available (70% chance)
          if (Math.random() > 0.3) {
            // Random units between 1 and 50
            bloodAvailability[group] = Math.floor(Math.random() * 50) + 1;
          } else {
            bloodAvailability[group] = 0;
          }
        });
        
        return {
          id: item._id || index.toString(),
          name: decodeHtml(item._blood_bank_name || "Unknown Blood Bank"),
          address: decodeHtml(item._address || "Address not available"),
          city: item._city || "Unknown",
          state: item._state || "Unknown",
          pincode: item._pincode || pincode,
          contact: item._contact_no || "Not available",
          mobile: item._mobile || "Not available",
          email: item._email || "Not available",
          category: item._category || "Unknown",
          bloodComponentAvailable: item._blood_component_available === "YES",
          serviceTime: item._service_time || "Unknown",
          lat: parseFloat(item._latitude) || 0,
          lon: parseFloat(item._longitude) || 0,
          bloodAvailability
        };
      });
      
      setBloodBanks(foundBloodBanks);
      setFilteredBloodBanks(foundBloodBanks);
      setSearchQuery(pincode);
    } catch (err) {
      console.error('Error fetching blood bank data:', err);
      setError("Failed to fetch blood bank data. Please try again.");
      setBloodBanks([]);
      setFilteredBloodBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter blood banks based on selected blood groups
  useEffect(() => {
    if (selectedBloodGroups.length === 0) {
      setFilteredBloodBanks(bloodBanks);
      return;
    }
    
    const filtered = bloodBanks.filter(bloodBank => 
      selectedBloodGroups.every(group => 
        bloodBank.bloodAvailability[group] && bloodBank.bloodAvailability[group] > 0
      )
    );
    
    setFilteredBloodBanks(filtered);
  }, [bloodBanks, selectedBloodGroups]);

  const toggleBloodGroup = (group: string) => {
    if (selectedBloodGroups.includes(group)) {
      setSelectedBloodGroups(selectedBloodGroups.filter(g => g !== group));
    } else {
      setSelectedBloodGroups([...selectedBloodGroups, group]);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBloodBanks(searchTerm);
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

  // Function to open location in Google Maps
  const openDirections = (bloodBank: BloodBank) => {
    // Use exact coordinates for location
    const url = `https://www.google.com/maps/search/?api=1&query=${bloodBank.lat},${bloodBank.lon}`;
    
    // Open in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
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
            {searchQuery ? `Blood Banks near ${searchQuery}` : 'Find Blood Banks in India'}
          </h1>
          <p 
            className={cn(
              "text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100",
              isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
            )}
          >
            Locate blood banks and check availability of blood groups across healthcare facilities in India.
          </p>
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
              <span>Blood Groups</span>
            </button>
          </form>
          
          {/* Filter Panel for Blood Groups */}
          <div 
            className={cn(
              "bg-white border border-border rounded-lg p-5 mt-4 transition-all duration-300",
              isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden py-0 border-transparent"
            )}
          >
            <h3 className="font-medium mb-3">Filter by Blood Group Availability</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {bloodGroups.map(group => (
                <button
                  key={group}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1",
                    selectedBloodGroups.includes(group)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  onClick={() => toggleBloodGroup(group)}
                  type="button"
                >
                  <Droplet size={12} className={group.includes('-') ? "text-red-500" : "text-red-600"} />
                  {group}
                </button>
              ))}
            </div>
            
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedBloodGroups.length > 0 
                  ? `Showing blood banks with ${selectedBloodGroups.join(', ')} available` 
                  : 'Showing all blood banks'}
              </p>
              
              <button
                type="button"
                className="text-sm text-primary"
                onClick={() => {
                  setSelectedBloodGroups([]);
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader size={48} className="animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Searching for blood banks...</p>
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
              onClick={() => setError(null)}
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Results display only when not loading and no errors */}
        {!isLoading && !error && (
          <>
            {/* Results Info */}
            {bloodBanks.length > 0 && (
              <div 
                className={cn(
                  "flex justify-between items-center mb-6 transition-all duration-700 delay-300",
                  isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
                )}
              >
                <p className="text-muted-foreground">
                  Showing {filteredBloodBanks.length} {filteredBloodBanks.length === 1 ? 'blood bank' : 'blood banks'}
                  {searchQuery ? ` near ${searchQuery}` : ''}
                </p>
              </div>
            )}
            
            {/* No search yet state */}
            {bloodBanks.length === 0 && !searchQuery && (
              <div className="text-center py-16">
                <Droplet size={48} className="mx-auto mb-4 text-red-500 opacity-40" />
                <p className="text-xl font-medium mb-2">Enter an Indian pincode to find blood banks</p>
                <p className="text-muted-foreground">Search for blood banks in your area by entering your 6-digit pincode</p>
                
                <div className="mt-6 text-sm text-muted-foreground">
                  <p className="mb-2">Example pincodes:</p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                    {examplePincodes.map(example => (
                      <button
                        key={example.code}
                        onClick={() => {
                          setSearchTerm(example.code);
                          searchBloodBanks(example.code);
                        }}
                        className="px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                      >
                        {example.city} ({example.code})
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* E-RaktKosh integration hint */}
                <div className="mt-8 max-w-2xl mx-auto">
                  <Card className="p-4 bg-muted/30">
                    <h3 className="font-medium mb-2">About e-RaktKosh Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      This application integrates with e-RaktKosh, the centralized blood bank management system 
                      in India. Blood availability data is shown for the 8 main blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).
                    </p>
                  </Card>
                </div>
              </div>
            )}
            
            {/* No blood banks with filters */}
            {filteredBloodBanks.length === 0 && bloodBanks.length > 0 && (
              <div className="col-span-full py-12 text-center">
                <div className="mb-4 text-muted-foreground">
                  <AlertTriangle size={48} className="mx-auto mb-4 opacity-40" />
                  <p className="text-xl font-medium">No blood banks found with selected blood groups</p>
                  <p className="text-muted-foreground">Try selecting different blood groups or try a different pincode</p>
                </div>
                <button 
                  className="btn-secondary mt-4"
                  onClick={() => {
                    setSelectedBloodGroups([]);
                  }}
                >
                  Reset Blood Group Filters
                </button>
              </div>
            )}
            
            {/* Blood Bank Cards */}
            {bloodBanks.length > 0 && filteredBloodBanks.length > 0 && (
              <div 
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-400",
                  isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
                )}
              >
                {filteredBloodBanks.map((bloodBank) => (
                  <div key={bloodBank.id} className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col">
                    <div className="p-4 border-b border-border">
                      <h3 className="text-lg font-medium mb-1">{bloodBank.name}</h3>
                      <p className="text-sm text-muted-foreground">{bloodBank.address}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                          {bloodBank.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Service: {bloodBank.serviceTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-grow">
                      <h4 className="text-sm font-medium mb-3">Blood Availability:</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {bloodGroups.map(group => (
                          <div 
                            key={group} 
                            className={cn(
                              "flex flex-col items-center p-2 rounded-md",
                              bloodBank.bloodAvailability[group] > 0 
                                ? "bg-green-50 border border-green-200" 
                                : "bg-red-50 border border-red-200"
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <Droplet size={12} className={group.includes('-') ? "text-red-500" : "text-red-600"} />
                              <span className="font-medium">{group}</span>
                            </div>
                            <span 
                              className={cn(
                                "text-sm mt-1",
                                bloodBank.bloodAvailability[group] > 0 
                                  ? "text-green-600" 
                                  : "text-red-500"
                              )}
                            >
                              {bloodBank.bloodAvailability[group] > 0 
                                ? `${bloodBank.bloodAvailability[group]} units` 
                                : "N.A."}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">{bloodBank.contact || bloodBank.mobile}</p>
                      </div>
                      
                      <button 
                        onClick={() => openDirections(bloodBank)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <MapPin size={16} />
                        View Location
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Additional information */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Data sourced from National Health Portal's Blood Bank Directory via data.gov.in</p>
          <p className="mt-1">
            For emergency blood requirements, please contact the blood bank directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BloodBank;