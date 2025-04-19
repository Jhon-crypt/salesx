/**
 * Authentication utilities for secure local storage handling
 */

// Encryption key (in a real app, this would be handled more securely)
const STORAGE_KEY = 'salesx_auth';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface UserData {
  id?: string;
  name?: string;
  email: string;
  token: string;
  expiresAt: number;
}

// Simple encryption function (this is minimal - in a real app, use a proper encryption library)
function encrypt(data: string): string {
  return btoa(data);
}

// Simple decryption function
function decrypt(data: string): string {
  try {
    return atob(data);
  } catch (error) {
    console.error('Failed to decrypt data');
    return '';
  }
}

// Store authentication data securely in localStorage
export function storeUserData(userData: UserData): void {
  try {
    // Set expiry time
    const expiresAt = Date.now() + TOKEN_EXPIRY;
    const dataToStore = { ...userData, expiresAt };
    
    // Encrypt the data before storing
    const encryptedData = encrypt(JSON.stringify(dataToStore));
    localStorage.setItem(STORAGE_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to store authentication data', error);
  }
}

// Get user data from localStorage
export function getUserData(): UserData | null {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    if (!encryptedData) return null;
    
    const decryptedData = decrypt(encryptedData);
    if (!decryptedData) return null;
    
    const userData = JSON.parse(decryptedData) as UserData;
    
    // Check if token has expired
    if (userData.expiresAt && userData.expiresAt < Date.now()) {
      clearUserData();
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Failed to retrieve authentication data', error);
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const userData = getUserData();
  return !!userData && !!userData.token && userData.expiresAt > Date.now();
}

// Clear authentication data
export function clearUserData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Register new user
export function registerUser(name: string, email: string, password: string): Promise<UserData> {
  // In a real app, this would be an API call to your backend
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Generate mock user data
      const userData: UserData = {
        id: `user_${Date.now()}`,
        name,
        email,
        token: `token_${Math.random().toString(36).substring(2, 15)}`,
        expiresAt: Date.now() + TOKEN_EXPIRY
      };
      
      // Store in localStorage
      storeUserData(userData);
      
      resolve(userData);
    }, 800);
  });
}

// Login user
export function loginUser(email: string, password: string): Promise<UserData> {
  // In a real app, this would be an API call to your backend
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      // For demo, we'll create a mock successful login
      // In a real app, this would verify credentials against a backend
      const userData: UserData = {
        id: `user_${Date.now()}`,
        email,
        token: `token_${Math.random().toString(36).substring(2, 15)}`,
        expiresAt: Date.now() + TOKEN_EXPIRY
      };
      
      // Store in localStorage
      storeUserData(userData);
      
      resolve(userData);
    }, 800);
  });
}

// Logout user
export function logoutUser(): void {
  clearUserData();
} 