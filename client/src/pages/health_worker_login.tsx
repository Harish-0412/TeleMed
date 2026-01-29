import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { User, Mail, Lock, Eye, EyeOff, Stethoscope } from 'lucide-react';

export default function HealthWorkerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get redirect URL from query parameters
  const getRedirectUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || '/';
  };

  // Handle Login
  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const redirectUrl = getRedirectUrl();
      window.location.hash = `#${redirectUrl}`;
    } catch (err: any) {
      // Handle different error types
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please create an account.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const redirectUrl = getRedirectUrl();
      window.location.hash = `#${redirectUrl}`;
    } catch (err: any) {
      // Handle different error types
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSignUp) {
        handleSignUp();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 flex items-center justify-center p-4 pt-24 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amazon-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amazon-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amazon-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className={`w-full max-w-md relative z-10 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Header Section */}
          <div className="text-center mb-8 transform transition-all duration-700" style={{ transitionDelay: '200ms' }}>
            <div className="bg-gradient-to-br from-amazon-600 to-amazon-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-3">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-amazon-700 to-amazon-600 bg-clip-text text-transparent">
              Health Worker Portal
            </h1>
            <p className="text-gray-600 transition-all duration-500">
              {isSignUp ? 'Create your account to get started' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Login/Signup Form Card */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-amazon-200/50 transform transition-all duration-700 ${mounted ? 'scale-100' : 'scale-95'}`} style={{ transitionDelay: '400ms' }}>
            {/* Email Input */}
            <div className="mb-6 transform transition-all duration-500" style={{ transitionDelay: '600ms' }}>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-3">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amazon-400 w-5 h-5 transition-colors group-focus-within:text-amazon-600" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 border-2 border-amazon-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amazon-500 focus:border-transparent text-base bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-amazon-300"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-8 transform transition-all duration-500" style={{ transitionDelay: '700ms' }}>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-3">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amazon-400 w-5 h-5 transition-colors group-focus-within:text-amazon-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-12 py-4 border-2 border-amazon-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amazon-500 focus:border-transparent text-base bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-amazon-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amazon-400 hover:text-amazon-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-sm text-amazon-600 mt-2 opacity-80">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-shake">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={isSignUp ? handleSignUp : handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amazon-600 to-amazon-700 hover:from-amazon-700 hover:to-amazon-800 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Please wait...
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* Toggle between Login and Sign Up */}
            <div className="text-center transform transition-all duration-500" style={{ transitionDelay: '800ms' }}>
              <p className="text-gray-600 mb-2">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-amazon-600 font-semibold hover:text-amazon-700 transition-all duration-300 hover:underline transform hover:scale-105"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className={`mt-8 text-center transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '900ms' }}>
            <p className="text-sm text-amazon-600 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 inline-block border border-amazon-200/50">
              🏥 For ASHA and ANM health workers only
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}