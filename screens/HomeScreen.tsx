import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../hooks/useTheme.tsx';
import { useLanguage } from '../hooks/useLanguage.tsx';
import { EventCard } from '../components/EventCard';

export default function HomeScreen() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { events, loading, error, searchEvents } = useEvents();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();

  // Load initial events on mount
  useEffect(() => {
    // Load some default events when the screen first loads
    searchEvents('', '');
  }, []);

  // Handle search submission
  const handleSearch = () => {
    setIsSearching(true);
    searchEvents(keyword, city);
  };

  // Navigate to event details
  const navigateToEventDetails = (event) => {
    navigation.navigate('EventDetail', { event });
  };

  // Render event item
  const renderEventItem = ({ item }) => (
    <EventCard 
      event={item}
      isFavorite={isFavorite(item.id)}
      onToggleFavorite={() => toggleFavorite(item)}
      onPress={() => navigateToEventDetails(item)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.card, 
        borderBottomColor: colors.border,
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('appName')}</Text>
      </View>
      
      {/* Search Section */}
      <View style={[styles.searchSection, { 
        backgroundColor: colors.card, 
        borderBottomColor: colors.border,
      }]}>
        <View style={[styles.searchInputContainer, { 
          backgroundColor: isDark ? colors.border : '#f5f5f5',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }]}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={colors.textSecondary} 
            style={isRTL ? styles.searchIconRTL : styles.searchIcon} 
          />
          <TextInput
            style={[styles.searchInput, { 
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left'
            }]}
            placeholder={t('search')}
            placeholderTextColor={colors.textTertiary}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
        
        <View style={[styles.searchInputContainer, { 
          backgroundColor: isDark ? colors.border : '#f5f5f5',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }]}>
          <Ionicons 
            name="location-outline" 
            size={20} 
            color={colors.textSecondary} 
            style={isRTL ? styles.searchIconRTL : styles.searchIcon} 
          />
          <TextInput
            style={[styles.searchInput, { 
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left'
            }]}
            placeholder="City..."
            placeholderTextColor={colors.textTertiary}
            value={city}
            onChangeText={setCity}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>{t('search')}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Results Section */}
      <View style={styles.resultsSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching events...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            {isSearching ? (
              <>
                <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noEvents')}</Text>
                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>{t('tryDifferent')}</Text>
              </>
            ) : (
              <>
                {Platform.OS !== 'web' ? (
                  <Image 
                    source={{ 
                      uri: isDark 
                        ? 'https://api.a0.dev/assets/image?text=City%20Events&aspect=1:1&seed=dark'
                        : 'https://api.a0.dev/assets/image?text=City%20Events&aspect=1:1&seed=light'
                    }} 
                    style={styles.emptyStateImage} 
                  />
                ) : (
                  <View style={[styles.emptyStateImagePlaceholder, { backgroundColor: isDark ? '#333' : '#eee' }]}>
                    <Ionicons name="calendar" size={60} color={isDark ? '#555' : '#ccc'} />
                  </View>
                )}
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('discover')}</Text>
                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>{t('searchPrompt')}</Text>
              </>
            )}
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.eventsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchIconRTL: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 8,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  eventsList: {
    paddingBottom: 16,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  emptyStateImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});