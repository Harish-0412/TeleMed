import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-ucXLNkli79MYBnCERaauNuoVYJpJls4",
  authDomain: "rural-telemedicine-demo.firebaseapp.com",
  projectId: "rural-telemedicine-demo",
  storageBucket: "rural-telemedicine-demo.firebasestorage.app",
  messagingSenderId: "280923866954",
  appId: "1:280923866954:web:d3da39d1977b9745e763b3",
  measurementId: "G-BFJH8CRLZ5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};