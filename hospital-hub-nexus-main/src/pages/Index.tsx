import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import HospitalCard from "@/components/HospitalCard";
import BloodBankStatus from "@/components/BloodBankStatus";
import HealthTips from "@/components/HealthTips";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define TypeScript interfaces for better type safety
interface Hospital {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  phoneNumber: string;
  isOpen: boolean;
  distance: string;
  services: string[];
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

const Index = () => {
  // Real hospital data
  const featuredHospitals = [
    {
      id: '1',
      name: 'Medica Superspecialty Hospital',
      address: '127 Mukundapur Main Rd, Kolkata, West Bengal 700099, India',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
      phoneNumber: '+91 33 6652 0000',
      isOpen: true,
      distance: '3.2 miles',
      services: ['Emergency', 'Surgery', 'Cardiology', 'Neurology', 'Oncology']
    },
    {
      id: '2',
      name: 'Medanta–The Medicity',
      address: 'CH Baktawar Singh Rd, Medicity, Islampur Colony, Sector 38, Gurugram, Haryana 122001, India',
      imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop',
      phoneNumber: '+91 124 414 1414',
      isOpen: true,
      distance: '5.7 miles',
      services: ['Emergency', 'Transplants', 'Cardiology', 'Orthopedics', 'Nephrology']
    },
    {
      id: '3',
      name: 'Apollo Hospital Greams Lane',
      address: '21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006, India',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop',
      phoneNumber: '+91 44 2829 3333',
      isOpen: true,
      distance: '2.5 miles',
      services: ['Emergency', 'Cardiology', 'Neurology', 'Oncology', 'Gastroenterology']
    }
  ];

  // Sample data for blood bank - fixing the type issue by explicitly using the correct union type
  const bloodBankData = {
    bloodBankName: 'Central Blood Bank',
    lastUpdated: '2 hours ago',
    bloodTypes: [
      { type: 'A+', status: 'high', quantity: 120 },
      { type: 'A-', status: 'medium', quantity: 45 },
      { type: 'B+', status: 'medium', quantity: 60 },
      { type: 'B-', status: 'low', quantity: 15 },
      { type: 'AB+', status: 'high', quantity: 40 },
      { type: 'AB-', status: 'low', quantity: 10 },
      { type: 'O+', status: 'medium', quantity: 85 },
      { type: 'O-', status: 'low', quantity: 20 }
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
      imageUrl: 'https://plus.unsplash.com/premium_photo-1702599018643-8c32c6d1394f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
          
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              className="group bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg"
              asChild
            >
              <Link to="/hospitals">
                View All Hospitals
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
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
          
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <BloodBankStatus {...bloodBankData} />
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              className="group bg-red-500 hover:bg-red-600 text-white px-8 py-6 rounded-full text-lg"
              asChild
            >
              <Link to="/blood-bank">
                View All Blood Banks
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Health Tips Section */}
      <HealthTips tips={healthTips} />
    </div>
  );
};

export default Index;
