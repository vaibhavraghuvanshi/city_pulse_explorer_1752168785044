import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Event interface to fix TypeScript errors
interface Event {
  id: string | number;
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  [key: string]: any; // Allow additional properties
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load favorites from AsyncStorage on component mount
  useEffect(() => {
    const loadFavorites = async (): Promise<void> => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          const parsedFavorites: Event[] = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever they change
  useEffect(() => {
    const saveFavorites = async (): Promise<void> => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };

    if (!loading) {
      saveFavorites();
    }
  }, [favorites, loading]);

  // Check if an event is in favorites
  const isFavorite = (eventId: string | number): boolean => {
    return favorites.some((event: Event) => event.id === eventId);
  };

  // Add or remove an event from favorites
  const toggleFavorite = (event: Event): void => {
    if (isFavorite(event.id)) {
      // Remove from favorites
      setFavorites(favorites.filter((fav: Event) => fav.id !== event.id));
    } else {
      // Add to favorites
      setFavorites([...favorites, event]);
    }
  };

  // Clear all favorites
  const clearFavorites = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('favorites');
      setFavorites([]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  };
};