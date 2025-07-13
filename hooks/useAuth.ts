import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';

// Dynamically require expo-local-authentication on native platforms, stub on web
let LocalAuthentication: typeof import('expo-local-authentication');
if (Platform.OS !== 'web') {
  LocalAuthentication = require('expo-local-authentication');
} else {
  // Stub methods for web -- no biometrics
  LocalAuthentication = {
    hasHardwareAsync: async () => false,
    isEnrolledAsync: async () => false,
    authenticateAsync: async () => ({ success: false }),
  } as any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  profileImage?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Load user profile from Firestore
          await loadUserProfile(firebaseUser.uid);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const createUserProfile = async (firebaseUser: FirebaseUser, additionalData?: any) => {
    try {
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || additionalData?.displayName || '',
        profileImage: additionalData?.profileImage || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      setUserProfile(userProfile);
      
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    try {
      const updatedProfile = { ...userProfile, ...updates };
      await updateDoc(doc(db, 'users', user.uid), updates);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: new Date()
      });

      // Store email for biometric login
      await AsyncStorage.setItem('lastLoggedInEmail', email);
      
      return firebaseUser;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, displayName?: string): Promise<FirebaseUser> => {
    try {
      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user profile in Firestore
      await createUserProfile(firebaseUser, { displayName });

      // Store email for biometric login
      await AsyncStorage.setItem('lastLoggedInEmail', email);
      
      return firebaseUser;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password';
          break;
        default:
          errorMessage = error.message || 'Registration failed';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Clear stored credentials on logout
      await AsyncStorage.removeItem('lastLoggedInEmail');
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Logout failed: ' + (error?.message || 'Unknown error'));
    }
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    try {
      // Check if device has biometric hardware
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        throw new Error('This device does not support biometric authentication');
      }

      // Check if biometric records exist
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        throw new Error('No biometrics enrolled on this device');
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometrics',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // Get stored email and password
        const email = await AsyncStorage.getItem('lastLoggedInEmail');
        const storedPassword = await AsyncStorage.getItem('biometricPassword');
        
        if (email && storedPassword) {
          // Login with stored credentials
          await login(email, storedPassword);
          return true;
        } else {
          throw new Error('No stored credentials found. Please login with email/password first and enable biometric login.');
        }
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      throw new Error('Biometric login failed: ' + (error?.message || 'Unknown error'));
    }
  };

  const enableBiometricLogin = async (password: string): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Verify the password first
      const email = await AsyncStorage.getItem('lastLoggedInEmail');
      if (!email) {
        throw new Error('No email found');
      }

      // Test login with provided password
      await signInWithEmailAndPassword(auth, email, password);

      // Store password for biometric login (in a real app, you'd want better security)
      await AsyncStorage.setItem('biometricPassword', password);
    } catch (error: any) {
      console.error('Enable biometric login error:', error);
      throw new Error('Failed to enable biometric login: ' + (error?.message || 'Unknown error'));
    }
  };

  const disableBiometricLogin = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('biometricPassword');
    } catch (error: any) {
      console.error('Disable biometric login error:', error);
      throw new Error('Failed to disable biometric login: ' + (error?.message || 'Unknown error'));
    }
  };

  return {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    loginWithBiometrics,
    enableBiometricLogin,
    disableBiometricLogin,
    updateUserProfile,
  };
};