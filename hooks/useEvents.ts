import { useState } from 'react';

// Ticketmaster API key
const API_KEY = 'HaKAZIdwAT7b8FxHiy8GCqbqkTg14466';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

// Mock data for fallback when API is unavailable
const MOCK_EVENTS = [
  {
    id: 'mock-event-1',
    name: 'Summer Music Festival',
    dates: {
      start: {
        dateTime: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        localDate: '2023-07-15',
        localTime: '19:00:00',
      }
    },
    _embedded: {
      venues: [{
        name: 'Central Park',
        city: { name: 'New York' },
        location: {
          latitude: '40.7829',
          longitude: '-73.9654',
        }
      }]
    },
    images: [
      {
        url: 'https://api.a0.dev/assets/image?text=Summer%20Music%20Festival&aspect=16:9&seed=event1',
        width: 400,
        height: 225
      }
    ],
    classifications: [
      {
        segment: { name: 'Music' },
        genre: { name: 'Pop' }
      }
    ],
    location: {
      latitude: 40.7829,
      longitude: -73.9654,
    }
  },
  {
    id: 'mock-event-2',
    name: 'Tech Conference 2023',
    dates: {
      start: {
        dateTime: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
        localDate: '2023-07-22',
        localTime: '09:00:00',
      }
    },
    _embedded: {
      venues: [{
        name: 'Convention Center',
        city: { name: 'San Francisco' },
        location: {
          latitude: '37.7749',
          longitude: '-122.4194',
        }
      }]
    },
    images: [
      {
        url: 'https://api.a0.dev/assets/image?text=Tech%20Conference&aspect=16:9&seed=event2',
        width: 400,
        height: 225
      }
    ],
    classifications: [
      {
        segment: { name: 'Conference' },
        genre: { name: 'Technology' }
      }
    ],
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    }
  },
  {
    id: 'mock-event-3',
    name: 'Art Exhibition',
    dates: {
      start: {
        dateTime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        localDate: '2023-07-11',
        localTime: '10:00:00',
      }
    },
    _embedded: {
      venues: [{
        name: 'Modern Art Museum',
        city: { name: 'Chicago' },
        location: {
          latitude: '41.8781',
          longitude: '-87.6298',
        }
      }]
    },
    images: [
      {
        url: 'https://api.a0.dev/assets/image?text=Art%20Exhibition&aspect=16:9&seed=event3',
        width: 400,
        height: 225
      }
    ],
    classifications: [
      {
        segment: { name: 'Arts & Theatre' },
        genre: { name: 'Exhibition' }
      }
    ],
    location: {
      latitude: 41.8781,
      longitude: -87.6298,
    }
  }
];

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search events by keyword and city
  const searchEvents = async (keyword = '', city = '') => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('apikey', API_KEY);
      
      if (keyword) {
        params.append('keyword', keyword);
      }
      
      if (city) {
        params.append('city', city);
      }
      
      // Add some default parameters
      params.append('size', '20'); // Number of results
      params.append('sort', 'date,asc'); // Sort by date ascending

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract events from response
        const fetchedEvents = data._embedded?.events || [];
        
        // Process events to add location data for map view
        const processedEvents = fetchedEvents.map((event) => {
          // Add location data if available
          if (event._embedded?.venues?.[0]) {
            const venue = event._embedded.venues[0];
            if (venue.location) {
              event.location = {
                latitude: parseFloat(venue.location.latitude),
                longitude: parseFloat(venue.location.longitude),
              };
            }
          }
          return event;
        });
        
        setEvents(processedEvents);
      } catch (fetchError) {
        console.warn('API fetch failed, using mock data:', fetchError.message);
        
        // Filter mock events based on search criteria
        let filteredMockEvents = [...MOCK_EVENTS];
        
        if (keyword) {
          const keywordLower = keyword.toLowerCase();
          filteredMockEvents = filteredMockEvents.filter(event => 
            event.name.toLowerCase().includes(keywordLower) || 
            event._embedded.venues[0].city.name.toLowerCase().includes(keywordLower)
          );
        }
        
        if (city) {
          const cityLower = city.toLowerCase();
          filteredMockEvents = filteredMockEvents.filter(event => 
            event._embedded.venues[0].city.name.toLowerCase().includes(cityLower)
          );
        }
        
        setEvents(filteredMockEvents);
      }
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Get event details by ID
  const getEventById = async (eventId) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have a mock event with this ID
      const mockEvent = MOCK_EVENTS.find(event => event.id === eventId);
      if (mockEvent) {
        return mockEvent;
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.append('apikey', API_KEY);

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(
          `${BASE_URL.replace('events.json', `events/${eventId}.json`)}?${params.toString()}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const event = await response.json();
        
        // Add location data if available
        if (event._embedded?.venues?.[0]) {
          const venue = event._embedded.venues[0];
          if (venue.location) {
            event.location = {
              latitude: parseFloat(venue.location.latitude),
              longitude: parseFloat(venue.location.longitude),
            };
          }
        }
        
        return event;
      } catch (fetchError) {
        console.warn('API fetch failed for event details, using mock data:', fetchError.message);
        
        // If we don't have a specific mock event, return the first one as a fallback
        return MOCK_EVENTS[0];
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    searchEvents,
    getEventById,
  };
};