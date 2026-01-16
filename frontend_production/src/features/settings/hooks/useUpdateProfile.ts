// src/pages/Settings/Profile/Hooks/useUpdateProfile.ts
import { useState, useCallback } from 'react';
import { ProfileServices } from '../services/profile.service';
import { UserData } from '../types/profile.types';

export default function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateUserProfile = useCallback(async (userId: string, data: Partial<UserData>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const updatedUser = await ProfileServices.updateUserProfile(userId, data);
      setSuccess(true);
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(false), []);

  return {
    loading,
    error,
    success,
    updateUserProfile,
    clearError,
    clearSuccess,
  };
}