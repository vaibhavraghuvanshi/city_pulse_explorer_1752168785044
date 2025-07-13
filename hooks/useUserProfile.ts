import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useUserProfile = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  // Set profile image
  const setProfileImage = async (imageUri: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      
      // Update user profile with new image URI
      await updateUserProfile({ profileImage: imageUri });
      
    } catch (error) {
      console.error('Error saving profile image:', error);
      throw new Error('Failed to update profile image');
    } finally {
      setLoading(false);
    }
  };

  // Set user name
  const setUserName = async (displayName: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      
      // Update user profile with new display name
      await updateUserProfile({ displayName });
      
    } catch (error) {
      console.error('Error saving user name:', error);
      throw new Error('Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  // Clear profile data (on logout) - handled by useAuth hook
  const clearProfileData = async () => {
    // This is handled automatically by the useAuth hook when user logs out
    console.log('Profile data will be cleared on logout');
  };

  // Upload image to Firebase Storage (optional enhancement)
  const uploadProfileImage = async (imageBlob: Blob): Promise<string> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      
      // For now, we'll use the image generation API
      // In a real app, you'd upload to Firebase Storage
      const imageUrl = `https://api.a0.dev/assets/image?text=Profile%20${user.uid}&aspect=1:1&seed=${user.uid}`;
      
      await setProfileImage(imageUrl);
      return imageUrl;
      
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error('Failed to upload profile image');
    } finally {
      setLoading(false);
    }
  };

  return {
    profileImage: userProfile?.profileImage || null,
    userName: userProfile?.displayName || null,
    userEmail: userProfile?.email || null,
    loading,
    setProfileImage,
    setUserName,
    clearProfileData,
    uploadProfileImage,
  };
};