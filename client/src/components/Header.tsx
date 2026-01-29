import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/contexts/AuthContext';
import PillNav from './PillNav';
import { useState } from 'react';

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const logoDataUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='%23ffffff'%3E%3Ctext x='16' y='24' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E`;

  const navItems = [
    { label: 'Consultations', href: '/consultations' },
    { label: 'Teleconsult', href: '/teleconsult' },
    { label: 'Eye Abnormal Detector', href: '/records' },
    { label: 'Pharmacy Finder', href: '/pharmacy' },
    { label: 'Prescriptions', href: '/prescriptions' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Navigation Pills - Left */}
        <div className="flex items-center justify-start">
          <PillNav
            logo={logoDataUrl}
            logoAlt="TeleMed Logo"
            items={navItems}
            activeHref={location}
            className="telemedicine-nav"
            ease="power2.easeOut"
            baseColor="#2f4d37"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#2f4d37"
            initialLoadAnimation={false}
          />
        </div>

        {/* User Info - Right */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:from-amazon-50 hover:to-amazon-100">
                <div className="w-6 h-6 bg-gradient-to-r from-amazon-600 to-amazon-700 rounded-full flex items-center justify-center transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                  <span className="text-white text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline transition-all duration-300">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="bg-gradient-to-r from-amazon-600 to-amazon-700 hover:from-amazon-700 hover:to-amazon-800 text-white px-6 py-2 rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 active:scale-95">
                Health Worker Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}