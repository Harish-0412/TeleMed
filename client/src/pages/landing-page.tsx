import { Link } from "wouter";
import {
  Calendar,
  Pill,
  Wifi,
  FileText,
  UserCheck,
  Stethoscope,
  ArrowRight,
  CheckCircle,
  Globe,
  Shield,
  Clock,
  Users,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StaggeredMenu from "@/components/StaggeredMenu";
import DotGrid from "@/components/DotGrid";
import FlowingMenu from "@/components/FlowingMenu";
import GridScan from "@/components/GridScan";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: 'Consultations', ariaLabel: 'Assisted consultation management', link: '/consultations' },
    { label: 'Teleconsult', ariaLabel: 'Low-bandwidth teleconsultation', link: '/teleconsult' },
    { label: 'Eye Abnormal Detector', ariaLabel: 'AI-powered eye abnormality detection', link: '/records' },
    { label: 'Pharmacy Finder', ariaLabel: 'Find nearby pharmacies and clinics', link: '/pharmacy' },
    { label: 'Buy Medicine', ariaLabel: 'Purchase medicines online', link: '/buy-medicine' },
    { label: 'Prescriptions', ariaLabel: 'E-prescription & pharmacy', link: '/prescriptions' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Contact', link: '/contact' }
  ];

  const features = [
    {
      icon: UserCheck,
      title: "Assisted Consultations for Rural Patients",
      shortTitle: "Consultations",
      description: "Bridging the gap between rural patients and specialist doctors through local healthcare facilitators.",
      details: [
        "Local facilitators assist patients during video consultations",
        "Real-time language translation and medical terminology explanation",
        "Cultural sensitivity training for better patient communication",
        "Emergency escalation protocols for critical cases",
        "Follow-up care coordination with local healthcare providers"
      ],
      href: "/consultations",
      color: "#4b7654",
      bgColor: "#f2f7f3"
    },
    {
      icon: Wifi,
      title: "Low-Bandwidth Teleconsultation System",
      shortTitle: "Teleconsult",
      description: "Optimized telemedicine platform that works reliably on 2G/3G networks in remote areas.",
      details: [
        "Text-first consultation interface with optional audio",
        "Compressed image sharing for medical documentation",
        "Offline mode with automatic sync when connected",
        "Bandwidth optimization algorithms for poor connections",
        "Progressive web app for any device compatibility"
      ],
      href: "/teleconsult",
      color: "#3a6143",
      bgColor: "#e0ebe0"
    },
    {
      icon: FileText,
      title: "AI-Powered Eye Abnormality Detection System",
      shortTitle: "Eye Abnormal Detector",
      description: "Advanced AI system for detecting eye abnormalities and diseases through image analysis and diagnostic support.",
      details: [
        "Real-time eye image analysis using machine learning",
        "Detection of cataracts, glaucoma, and retinal disorders",
        "Automated screening reports with confidence scores",
        "Integration with telemedicine consultations",
        "Offline AI processing for remote area compatibility"
      ],
      href: "/records",
      color: "#2f4d37",
      bgColor: "#c3d7c5"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling & Doctor Availability Management",
      shortTitle: "Appointments",
      description: "Intelligent scheduling system that manages doctor availability and patient appointments efficiently.",
      details: [
        "Real-time doctor availability tracking",
        "Automated appointment reminders via SMS/WhatsApp",
        "Queue management for walk-in patients",
        "Multi-location clinic coordination",
        "Emergency slot allocation for urgent cases"
      ],
      href: "/appointments",
      color: "#273e2d",
      bgColor: "#9abb9f"
    },
    {
      icon: Pill,
      title: "E-Prescription & Local Pharmacy Guidance",
      shortTitle: "Prescriptions",
      description: "Digital prescription system with local pharmacy integration and medication availability tracking.",
      details: [
        "Digital prescription generation and verification",
        "Local pharmacy inventory integration",
        "Generic medication alternatives suggestion",
        "Dosage and interaction warnings",
        "Medication adherence tracking and reminders"
      ],
      href: "/prescriptions",
      color: "#203426",
      bgColor: "#6e9975"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    if (featureRefs.current[activeFeature]) {
      const element = featureRefs.current[activeFeature];
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px) scale(0.95)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0px) scale(1)';
      }, 50);
    }
  }, [activeFeature]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 relative">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 z-0" style={{ height: '200vh' }}>
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#e0ebe0"
          activeColor="#4b7654"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          style={{}}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Staggered Menu */}
      {/* @ts-expect-error - StaggeredMenu type definitions are incomplete */}
      <StaggeredMenu
        position="right"
        items={[...menuItems] as any}
        socialItems={[...socialItems] as any}
        displaySocials
        displayItemNumbering={true}
        menuButtonColor="#2f4d37"
        openMenuButtonColor="#000"
        changeMenuColorOnOpen={true}
        colors={['#4b7654', '#2f4d37']}
        logoUrl=""
        accentColor="#2f4d37"
        isFixed={true}
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={() => console.log('Menu closed')}
      />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-gray-900 mb-6">
            Healthcare <span className="text-amazon-600">Everywhere</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Comprehensive telemedicine platform designed specifically for rural healthcare delivery with 
            offline capabilities, low-bandwidth optimization, and local facilitator support.
          </p>
          
          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-6 py-3 text-sm font-medium text-gray-700">
                  <div className="w-8 h-8 bg-gradient-to-r from-amazon-600 to-amazon-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-medium transform transition-all duration-300 hover:scale-105"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="bg-gradient-to-r from-amazon-600 to-amazon-700 hover:from-amazon-700 hover:to-amazon-800 text-white px-8 py-3 rounded-lg font-medium transform transition-all duration-300 hover:scale-105">
                  Health Worker Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Platform Features & Capabilities Section */}
      <section className="py-20 px-6" ref={containerRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Platform Features & Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the powerful features that make our telemedicine platform ideal for rural healthcare delivery.
            </p>
          </div>
          
          {/* FlowingMenu for Features */}
          <div className="h-[500px] mb-16">
            <FlowingMenu
              items={[
                {
                  text: 'Assisted Consultations',
                  link: '/consultations',
                  image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop&crop=face'
                },
                {
                  text: 'Low-Bandwidth Teleconsult',
                  link: '/teleconsult',
                  image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop&crop=center'
                },
                {
                  text: 'AI Eye Detection',
                  link: '/records',
                  image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=100&fit=crop&crop=center'
                },
                {
                  text: 'Smart Appointments',
                  link: '/appointments',
                  image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=100&h=100&fit=crop&crop=center'
                },
                {
                  text: 'E-Prescriptions',
                  link: '/prescriptions',
                  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&crop=center'
                }
              ]}
              speed={20}
              textColor="#2f4d37"
              bgColor="#ffffff"
              marqueeBgColor="#000000"
              marqueeTextColor="#ffffff"
              borderColor="#e5e7eb"
            />
          </div>
        </div>
      </section>

      {/* GridScan Interactive Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-amazon-50 via-white to-amazon-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Demo Video of Our Project
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience our cutting-edge grid scanning technology that powers our AI diagnostic systems.
            </p>
          </div>
          
          <div className="relative h-96 rounded-lg overflow-hidden border border-amazon-200 bg-amazon-50/30 backdrop-blur-sm">
            <GridScan
              sensitivity={0.6}
              lineThickness={1.2}
              linesColor="#4b7654"
              gridScale={0.08}
              scanColor="#2f4d37"
              scanOpacity={0.9}
              enablePost
              bloomIntensity={0.3}
              chromaticAberration={0.0005}
              noiseIntensity={0.003}
              scanGlow={0.8}
              scanSoftness={2.5}
              scanDuration={2.5}
              scanDelay={1.0}
            />
            
            {/* Video Box in Center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-48 bg-white/80 backdrop-blur-sm rounded-lg border border-amazon-300 flex items-center justify-center group hover:border-amazon-500 transition-all duration-300 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-amazon-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-amazon-200 transition-colors">
                  <Play className="w-8 h-8 text-amazon-600 ml-1" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">AI Detection Demo</h3>
                <p className="text-gray-600 text-sm">See how our technology works</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Move your mouse over the grid to interact with the scanning system
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-amazon-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              How Our Platform Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deep dive into each feature and understand how they work together to provide comprehensive rural healthcare.
            </p>
          </div>
          
          {/* FlowingMenu for How It Works */}
          <div className="h-[450px] mb-20">
            <FlowingMenu
              items={[
                {
                  text: 'Patient Registration',
                  link: '/consultations',
                  image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=100&fit=crop&crop=face'
                },
                {
                  text: 'Health Assessment',
                  link: '/records',
                  image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop&crop=center'
                },
                {
                  text: 'Doctor Consultation',
                  link: '/teleconsult',
                  image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face'
                },
                {
                  text: 'AI Diagnosis Support',
                  link: '/prescriptions',
                  image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop&crop=center'
                },
                {
                  text: 'Treatment & Follow-up',
                  link: '/appointments',
                  image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop&crop=center'
                }
              ]}
              speed={25}
              textColor="#2f4d37"
              bgColor="#ffffff"
              marqueeBgColor="#000000"
              marqueeTextColor="#ffffff"
              borderColor="#e5e7eb"
            />
          </div>
          
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
              Ready to Transform Rural Healthcare?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join healthcare providers using our platform to deliver quality care to rural communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultations">
                <Button size="lg" className="h-12 px-8 text-base bg-amazon-600 hover:bg-amazon-700">
                  Start Consultation
                </Button>
              </Link>
              <Link href="/pharmacy">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-amazon-600 text-amazon-600 hover:bg-amazon-50">
                  Find Pharmacy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">TeleMed</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Comprehensive telemedicine platform designed specifically for rural healthcare delivery with 
                offline capabilities and local facilitator support.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/consultations" className="text-gray-300 hover:text-white transition-colors">Consultations</Link></li>
                <li><Link href="/teleconsult" className="text-gray-300 hover:text-white transition-colors">Teleconsult</Link></li>
                <li><Link href="/records" className="text-gray-300 hover:text-white transition-colors">Eye Detection</Link></li>
                <li><Link href="/pharmacy" className="text-gray-300 hover:text-white transition-colors">Pharmacy Finder</Link></li>
                <li><Link href="/prescriptions" className="text-gray-300 hover:text-white transition-colors">Prescriptions</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 TeleMed. All rights reserved. Empowering rural healthcare through technology.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
