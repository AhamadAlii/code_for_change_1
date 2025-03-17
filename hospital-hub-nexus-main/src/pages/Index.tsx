import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import HospitalCard from "@/components/HospitalCard";
import BloodBankStatus from "@/components/BloodBankStatus";
import HealthTips from "@/components/HealthTips";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define TypeScript interfaces for better type safety
interface Hospital {
  id: string;
  name: string;
  address: string;
  rating: string;
  imageUrl: string;
  phoneNumber: string;
  isOpen: boolean;
  distance: string;
  services: string[];
  lat?: number;
  lon?: number;
  isCached?: boolean;
}

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

interface HealthTip {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  readTime: string;
}

const Index: React.FC = () => {
  const [featuredHospitals, setFeaturedHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [page, setPage] = useState<number>(1);
  const [bloodBankData, setBloodBankData] = useState<BloodBank | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const cachedData = localStorage.getItem("hospitals");
        if (cachedData) {
          setFeaturedHospitals(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const overpassQuery = `
          [out:json][timeout:25];
          area[name="India"]->.searchArea;
          node["amenity"="hospital"](area.searchArea);
          out body;
        `;
        const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          overpassQuery
        )}`;

        const response = await fetch(apiUrl, { method: "GET", mode: "cors" });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        if (!data.elements) throw new Error("Invalid API response");
        const deg2rad = (deg: number) => {
          return deg * (Math.PI / 180);
        };

        const getDistanceFromLatLonInKm = (
          lat1: number,
          lon1: number,
          lat2: number,
          lon2: number
        ) => {
          const R = 6371; // Radius of the earth in km
          const dLat = deg2rad(lat2 - lat1);
          const dLon = deg2rad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
              Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; // Distance in km
          return distance;
        };

        // Extract hospital details from API response
        const hospitals: Hospital[] = data.elements
          .map(
            (item: {
              id: number;
              tags: { [key: string]: string };
              lat: number;
              lon: number;
            }) => ({
              id: item.id.toString(),
              name: item.tags.name || "Unnamed Hospital",
              address: item.tags["addr:full"] || "Address not available",
              rating: (Math.random() * 2 + 3).toFixed(1), // Generate rating between 3.0 - 5.0
              imageUrl: "https://source.unsplash.com/featured/?hospital",
              phoneNumber: item.tags.phone || "N/A",
              isOpen: Math.random() > 0.5, // Random open/closed status
              distance: `${(Math.random() * 10).toFixed(1)} km`,
              services: [
                "Emergency",
                "Surgery",
                "Cardiology",
                "Pediatrics",
                "Neurology",
                "Orthopedics",
                "Oncology",
                "Radiology",
                "Laboratory",
                "Primary Care",
                "Ayurvedic",
                "Homeopathic",
                "Alternative Medicine",
                "Wellness",
                "Physiotherapy",
              ],
              lat: item.lat,
              lon: item.lon,
            })
          )
          .filter(
            (hospital: Hospital) =>
              hospital.isOpen && /^[A-Za-z\s]+$/.test(hospital.name)
          );

        if (userLocation) {
          const filteredHospitals = hospitals.filter((hospital) => {
            if (hospital.lat && hospital.lon) {
              const distance = getDistanceFromLatLonInKm(
                userLocation.lat,
                userLocation.lon,
                hospital.lat,
                hospital.lon
              );
              return distance <= 5; // Filter hospitals within 5 km radius
            }
            return false;
          });

          localStorage.setItem("hospitals", JSON.stringify(filteredHospitals));
          setFeaturedHospitals(filteredHospitals.slice(0, 6)); // Display first 6 hospitals
        } else {
          localStorage.setItem("hospitals", JSON.stringify(hospitals));
          setFeaturedHospitals(hospitals.slice(0, 6)); // Display first 6 hospitals
        }
      } catch (error) {
        console.error("Error fetching hospital data:", error);
      } finally {
        setLoading(false);
      }
    };

    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting user location:", error);
          }
        );
      }
    };

    const fetchBloodBankData = async () => {
      try {
        if (!userLocation) {
          console.error("User location is not available");
          return;
        }

        const response = await axios.get(
          "https://api.data.gov.in/resource/fced6df9-a360-4e08-8ca0-f283fc74ce15",
          {
            params: {
              "api-key":
                "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
              format: "json",
              limit: 10, // Limit the number of results
            },
            headers: {
              "Access-Control-Allow-Origin": "*", // Add CORS header
            },
          }
        );
        const data = response.data.records;
        // console.log("Blood Bank Data:", data);

        const deg2rad = (deg: number) => {
          return deg * (Math.PI / 180);
        };

        const getDistanceFromLatLonInKm = (
          lat1: number,
          lon1: number,
          lat2: number,
          lon2: number
        ) => {
          const R = 6371; // Radius of the earth in km
          const dLat = deg2rad(lat2 - lat1);
          const dLon = deg2rad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
              Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; // Distance in km
          return distance;
        };

        const nearestBloodBank = data.reduce(
          (
            nearest: any,
            item: {
              latitude: string;
              longitude: string;
              blood_bank_name: string;
              address: string;
              city: string;
              state: string;
              pincode: string;
              contact: string;
              mobile: string;
              email: string;
              category: string;
              blood_component_available: string;
              service_time: string;
              blood_group: string;
              units: string;
            }
          ) => {
            const distance = getDistanceFromLatLonInKm(
              userLocation.lat,
              userLocation.lon,
              parseFloat(item.latitude),
              parseFloat(item.longitude)
            );
            if (!nearest || distance < nearest.distance) {
              return { ...item, distance };
            }
            return nearest;
          },
          null
        );

        if (!nearestBloodBank) {
          console.error("No blood banks found");
          return;
        }

        const bloodBank: BloodBank = {
          id: nearestBloodBank.id,
          name: nearestBloodBank.blood_bank_name,
          address: nearestBloodBank.address,
          city: nearestBloodBank.city,
          state: nearestBloodBank.state,
          pincode: nearestBloodBank.pincode,
          contact: nearestBloodBank.contact,
          mobile: nearestBloodBank.mobile,
          email: nearestBloodBank.email,
          category: nearestBloodBank.category,
          bloodComponentAvailable:
            nearestBloodBank.blood_component_available === "yes",
          serviceTime: nearestBloodBank.service_time,
          lat: parseFloat(nearestBloodBank.latitude),
          lon: parseFloat(nearestBloodBank.longitude),
          bloodAvailability: data.reduce((acc: any, item: any) => {
            acc[item.blood_group] = parseInt(item.units, 10) || "0";
            return acc;
          }, {}),
        };
        setBloodBankData(bloodBank);
      } catch (error) {
        console.error("Error fetching blood bank data:", error);
      }
    };

    getUserLocation();
    fetchHospitals();
    if (userLocation) {
      fetchBloodBankData();
    }
  }, [userLocation]);

  const loadMoreHospitals = () => {
    navigate("/hospitals", {
      state: { hospitals: featuredHospitals.slice(page * 6) },
    });
    scrollTo(0, 0);
  };

  const displayedHospitals = featuredHospitals.slice(0, page * 6);

  // 3a88c5d678e4f15c0298556668efa576
  // Sample Health Tips Data
  const healthTips: HealthTip[] = [
    {
      id: "1",
      title: "The Importance of Regular Blood Donation",
      excerpt:
        "Donating blood regularly not only helps others but also offers several health benefits for donors.",
      imageUrl:
        "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1974&auto=format&fit=crop",
      category: "Blood Donation",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "5 Heart-Healthy Habits to Adopt Today",
      excerpt:
        "Maintaining good heart health is essential for overall wellbeing. Discover five simple habits that can significantly improve your cardiovascular health.",
      imageUrl:
        "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1974&auto=format&fit=crop",
      category: "Heart Health",
      readTime: "4 min",
    },
    {
      id: "3",
      title: "Understanding Blood Types and Compatibility",
      excerpt:
        "Blood types play a crucial role in transfusions and medical procedures. Learn about different blood types and their compatibility for donations.",
      imageUrl:
        "https://images.unsplash.com/photo-1626958390878-00a829a8e929?q=80&w=2070&auto=format&fit=crop",
      category: "Blood Donation",
      readTime: "6 min",
    },
  ];

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Featured Hospitals Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Featured Hospitals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover top-rated hospitals in your area with comprehensive
              medical services and facilities.
            </p>
          </div>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedHospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  {...hospital}
                  rating={parseFloat(hospital.rating)}
                  onDirectionsClick={() => {
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;
                    window.open(googleMapsUrl, "_blank");
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <button onClick={loadMoreHospitals} className="btn-secondary">
              Load More Hospitals
            </button>
          </div>
        </div>
      </section>

      {/* Blood Bank Status Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Blood Bank Status
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Monitor real-time blood availability across different blood
              groups. Your donation can save lives.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {bloodBankData ? (
              (bloodBankData.name && bloodBankData.address) ||
              (bloodBankData.city &&
                bloodBankData.state &&
                bloodBankData.pincode &&
                bloodBankData.contact &&
                bloodBankData.mobile) ||
              bloodBankData.email ||
              bloodBankData.category ||
              bloodBankData.serviceTime ? (
                <BloodBankStatus
                  bloodBankName={bloodBankData.name}
                  lastUpdated={bloodBankData.serviceTime}
                  bloodTypes={
                    bloodBankData && bloodBankData.bloodAvailability
                      ? Object.keys(bloodBankData.bloodAvailability).map(
                          (type) => ({
                            type,
                            status:
                              bloodBankData.bloodAvailability[type] > 10
                                ? "high"
                                : bloodBankData.bloodAvailability[type] > 5
                                ? "medium"
                                : "low",
                            quantity: bloodBankData.bloodAvailability[type],
                          })
                        )
                      : []
                  }
                  address={bloodBankData.address}
                  city={bloodBankData.city}
                  state={bloodBankData.state}
                  pincode={bloodBankData.pincode}
                  contact={bloodBankData.contact}
                  mobile={bloodBankData.mobile}
                  email={bloodBankData.email}
                  category={bloodBankData.category}
                  bloodComponentAvailable={
                    bloodBankData.bloodComponentAvailable
                  }
                />
              ) : (
                <p className="text-center">
                  There is no blood bank found near you.
                </p>
              )
            ) : (
              <p className="text-center">Loading blood bank data...</p>
            )}
          </div>
        </div>
      </section>

      {/* Health Tips Section */}
      <HealthTips tips={healthTips} />
    </div>
  );
};

export default Index;
