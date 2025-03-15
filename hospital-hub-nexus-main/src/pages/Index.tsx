
import Hero from '@/components/Hero';
import HospitalCard from '@/components/HospitalCard';
import BloodBankStatus from '@/components/BloodBankStatus';
import HealthTips from '@/components/HealthTips';

const Index = () => {
  // Sample data for hospitals
  const featuredHospitals = [
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
    }
  ];

  // Sample data for blood bank - fixing the type issue by explicitly using the correct union type
  const bloodBankData = {
    bloodBankName: 'Central Blood Bank',
    lastUpdated: '2 hours ago',
    bloodTypes: [
      { type: 'A+', status: 'high' as 'high', quantity: 120 },
      { type: 'A-', status: 'medium' as 'medium', quantity: 45 },
      { type: 'B+', status: 'medium' as 'medium', quantity: 60 },
      { type: 'B-', status: 'low' as 'low', quantity: 15 },
      { type: 'AB+', status: 'high' as 'high', quantity: 40 },
      { type: 'AB-', status: 'low' as 'low', quantity: 10 },
      { type: 'O+', status: 'medium' as 'medium', quantity: 85 },
      { type: 'O-', status: 'low' as 'low', quantity: 20 }
    ]
  };

  // Sample data for health tips
  const healthTips = [
    {
      id: '1',
      title: 'The Importance of Regular Blood Donation',
      excerpt: 'Donating blood regularly not only helps others but also offers several health benefits for donors. Learn why you should consider becoming a regular blood donor.',
      imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1974&auto=format&fit=crop',
      category: 'Blood Donation',
      readTime: '5 min'
    },
    {
      id: '2',
      title: '5 Heart-Healthy Habits to Adopt Today',
      excerpt: 'Maintaining good heart health is essential for overall wellbeing. Discover five simple habits that can significantly improve your cardiovascular health.',
      imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1974&auto=format&fit=crop',
      category: 'Heart Health',
      readTime: '4 min'
    },
    {
      id: '3',
      title: 'Understanding Blood Types and Compatibility',
      excerpt: 'Blood types play a crucial role in transfusions and medical procedures. Learn about different blood types and their compatibility for donations.',
      imageUrl: 'https://images.unsplash.com/photo-1626958390878-00a829a8e929?q=80&w=2070&auto=format&fit=crop',
      category: 'Blood Donation',
      readTime: '6 min'
    }
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Featured Hospitals Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Featured Hospitals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover top-rated hospitals in your area with comprehensive medical services and facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHospitals.map((hospital) => (
              <HospitalCard key={hospital.id} {...hospital} />
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <a href="/hospitals" className="btn-secondary">
              View All Hospitals
            </a>
          </div>
        </div>
      </section>
      
      {/* Blood Bank Status Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Blood Bank Status</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Monitor real-time blood availability across different blood groups. Your donation can save lives.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <BloodBankStatus {...bloodBankData} />
          </div>
        </div>
      </section>
      
      {/* Health Tips Section */}
      <HealthTips tips={healthTips} />
    </div>
  );
};

export default Index;
