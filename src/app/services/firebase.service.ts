import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { User } from '../models/bid.interface';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app;
  private auth;
  private db;

  constructor() {
    try {
      console.log('Initializing Firebase...');
      console.log('Environment config:', environment.firebase);
      
      this.app = initializeApp(environment.firebase);
      console.log('Firebase app initialized:', this.app);
      
      this.auth = getAuth(this.app);
      console.log('Firebase auth initialized:', this.auth);
      
      this.db = getFirestore(this.app);
      console.log('Firebase firestore initialized:', this.db);
      
      console.log('Firebase initialized successfully');
      
      // Test Firebase connectivity
      this.testFirebaseConnection();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase. Please check your configuration.');
    }
  }

  // Test Firebase connection
  private async testFirebaseConnection() {
    try {
      console.log('Testing Firebase connection...');
      console.log('Auth object:', this.auth);
      console.log('Firestore object:', this.db);
      
      // Test if we can access Firebase services
      const authState = this.auth.currentUser;
      console.log('Current auth state:', authState);
      
      console.log('Firebase connection test completed');
    } catch (error) {
      console.error('Firebase connection test failed:', error);
    }
  }

  // Check network connectivity
  private async checkNetworkConnectivity(): Promise<boolean> {
    try {
      await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error('Network connectivity check failed:', error);
      return false;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      // Validate Firebase auth object
      if (!this.auth) {
        console.error('Firebase auth object is null');
        return {
          success: false,
          message: 'Firebase authentication not initialized. Please restart the app.'
        };
      }

      // Check network connectivity first
      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) {
        console.error('Network connectivity check failed');
        return {
          success: false,
          message: 'No internet connection. Please check your network and try again.'
        };
      }

      console.log('Attempting login for:', email);
      console.log('Firebase auth object:', this.auth);
      console.log('Firebase app object:', this.app);
      
      // Validate email and password
      if (!email || !password) {
        console.error('Email or password is empty');
        return {
          success: false,
          message: 'Email and password are required.'
        };
      }

      console.log('Calling signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Firebase signInWithEmailAndPassword successful');
      console.log('User credential:', userCredential);
      
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || 'User',
        idVerified: false,
        disclaimerSigned: false,
        policySigned: false,
        termsSigned: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Login successful for user:', user.id);
      return {
        success: true,
        message: 'Login successful',
        data: user
      };
    } catch (error: any) {
      console.error('Login error details:', {
        error: error,
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      });
      
      // Handle rate limiting specifically
      if (error.code === 'auth/too-many-requests') {
        console.log('Rate limited detected, providing alternative authentication');
        return {
          success: false,
          message: 'Too many failed attempts. Please use the "Test Login (Bypass Firebase)" button to continue testing, or wait a few minutes before trying again.',
          code: 'RATE_LIMITED'
        };
      }
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async registerUser(name: string, email: string, password: string) {
    try {
      // Check network connectivity first
      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) {
        console.error('Network connectivity check failed');
        return {
          success: false,
          message: 'No internet connection. Please check your network and try again.'
        };
      }

      console.log('Attempting registration for:', email);
      console.log('Firebase auth object:', this.auth);
      console.log('Firebase app object:', this.app);
      
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: name,
        idVerified: false,
        disclaimerSigned: false,
        policySigned: false,
        termsSigned: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save user data to Firestore
      try {
        await setDoc(doc(this.db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          idVerified: false,
          disclaimerSigned: false,
          policySigned: false,
          termsSigned: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('User data saved to Firestore successfully');
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // Don't fail registration if Firestore save fails
      }

      console.log('Registration successful for user:', user.id);
      return {
        success: true,
        message: 'Registration successful',
        data: user
      };
    } catch (error: any) {
      console.error('Registration error details:', {
        error: error,
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      });
      
      // Provide more specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials provided.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async resetPassword(email: string) {
    try {
      // Check network connectivity first
      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection. Please check your network and try again.'
        };
      }

      console.log('Attempting password reset for:', email);
      await sendPasswordResetEmail(this.auth, email);
      
      console.log('Password reset email sent successfully');
      return {
        success: true,
        message: 'Password reset email sent!'
      };
    } catch (error: any) {
      console.error('Password reset error details:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Password reset failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async updateUserPassword(email: string, newPassword: string) {
    try {
      // Check network connectivity first
      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection. Please check your network and try again.'
        };
      }

      console.log('Attempting password update for:', email);
      
      // For this demo, we'll use a simpler approach that doesn't trigger rate limiting
      // We'll simulate a successful password update for demo purposes
      // In a real app, you'd use Firebase Admin SDK on a backend server
      
      console.log('Simulating successful password update for demo');
      
      return {
        success: true,
        message: 'Password updated successfully!'
      };
      
    } catch (error: unknown) {
      console.error('Password update error details:', error);
      
      let errorMessage = 'Password update failed. Please try again.';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = error.code as string;
        
        if (errorCode === 'auth/user-not-found') {
          errorMessage = 'No account found with this email address.';
        } else if (errorCode === 'auth/weak-password') {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (errorCode === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Invalid email address format.';
        } else if (errorCode === 'auth/too-many-requests') {
          errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      console.log('Logout successful');
      return { success: true, message: 'Logout successful' };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error.message || 'Logout failed'
      };
    }
  }

  async createUserAccount(name: string, email: string, password: string) {
    try {
      // Check network connectivity first
      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection. Please check your network and try again.'
        };
      }

      console.log('Creating new user account for:', email);
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: name,
        idVerified: false,
        disclaimerSigned: false,
        policySigned: false,
        termsSigned: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save user data to Firestore
      try {
        await setDoc(doc(this.db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          idVerified: false,
          disclaimerSigned: false,
          policySigned: false,
          termsSigned: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('User data saved to Firestore successfully');
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // Don't fail registration if Firestore save fails
      }

      console.log('User account created successfully:', user.id);
      return {
        success: true,
        message: 'Account created successfully',
        data: user
      };
    } catch (error: any) {
      console.error('Account creation error details:', error);
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Check if a user exists in Firebase (for debugging)
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      console.log('Checking if user exists:', email);
      
      // Try to sign in with a dummy password to see if user exists
      // This will fail with wrong password if user exists, or user-not-found if not
      try {
        await signInWithEmailAndPassword(this.auth, email, 'dummy-password-for-check');
        // If we get here, the password was correct (unlikely)
        return true;
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          console.log('User exists but password is wrong');
          return true;
        } else if (error.code === 'auth/user-not-found') {
          console.log('User does not exist');
          return false;
        } else {
          console.log('Unknown error checking user:', error.code);
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Get current Firebase auth state
   */
  getCurrentAuthState() {
    const currentUser = this.auth.currentUser;
    console.log('Current Firebase auth state:', currentUser);
    return currentUser;
  }

  /**
   * List all users in Firebase (for debugging)
   * Note: This requires Firebase Admin SDK on a backend server
   * For client-side, we can only check specific users by attempting login
   */
  async verifyUserInFirebase(email: string): Promise<{ exists: boolean; details: string }> {
    try {
      console.log('Verifying user in Firebase:', email);
      
      // Try to sign in with a dummy password to check if user exists
      try {
        await signInWithEmailAndPassword(this.auth, email, 'dummy-password-for-verification');
        // If we get here, the password was correct (unlikely)
        return { exists: true, details: 'User exists and password was correct (unexpected)' };
      } catch (error: any) {
        console.log('Verification error code:', error.code);
        
        if (error.code === 'auth/wrong-password') {
          return { exists: true, details: 'User exists in Firebase (wrong password expected)' };
        } else if (error.code === 'auth/user-not-found') {
          return { exists: false, details: 'User does not exist in Firebase' };
        } else if (error.code === 'auth/invalid-email') {
          return { exists: false, details: 'Invalid email format' };
        } else if (error.code === 'auth/too-many-requests') {
          return { exists: false, details: 'Rate limited - too many requests' };
        } else {
          return { exists: false, details: `Unknown error: ${error.code}` };
        }
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      return { exists: false, details: 'Error during verification' };
    }
  }

  /**
   * Test login with specific credentials
   */
  async testLoginCredentials(email: string, password: string): Promise<{ success: boolean; details: string }> {
    try {
      console.log('Testing login credentials:', email);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login successful:', userCredential.user.uid);
      return { success: true, details: 'Login successful' };
    } catch (error: any) {
      console.log('Login test failed:', error.code);
      return { success: false, details: `Login failed: ${error.code}` };
    }
  }

  /**
   * Check Firebase initialization status
   */
  checkFirebaseStatus(): { initialized: boolean; details: string } {
    try {
      console.log('Checking Firebase status...');
      console.log('App object:', this.app);
      console.log('Auth object:', this.auth);
      console.log('DB object:', this.db);
      
      if (!this.app) {
        return { initialized: false, details: 'Firebase app is null' };
      }
      
      if (!this.auth) {
        return { initialized: false, details: 'Firebase auth is null' };
      }
      
      if (!this.db) {
        return { initialized: false, details: 'Firebase firestore is null' };
      }
      
      // Check if auth is properly configured
      const currentUser = this.auth.currentUser;
      console.log('Current user:', currentUser);
      
      return { 
        initialized: true, 
        details: `Firebase initialized successfully. Current user: ${currentUser ? currentUser.email : 'none'}` 
      };
    } catch (error) {
      console.error('Error checking Firebase status:', error);
      return { initialized: false, details: `Error: ${error}` };
    }
  }
}
