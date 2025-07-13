import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Linking,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../hooks/useTheme.tsx';
import { useLanguage } from '../hooks/useLanguage.tsx';

// Conditionally import MapView
let MapView, Marker;
try {
  // This will be used on native platforms
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (error) {
  // This will be used on web when react-native-maps is not available
  MapView = null;
  Marker = null;
}

export default function EventDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { event } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  
  const isFavorited = isFavorite(event.id);
  
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleBuyTickets = () => {
    if (event.url) {
      Linking.openURL(event.url);
    }
  };
  
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  const hasLocation = event.location && 
    event.location.latitude && 
    event.location.longitude;

  // Function to render map or fallback
  const renderMap = () => {
    if (!hasLocation) return null;
    
    if (MapView) {
      return (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('location')}</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: event.location.latitude,
                  longitude: event.location.longitude,
                }}
                title={event.name}
              />
            </MapView>
          </View>
        </>
      );
    } else {
      // Fallback for platforms where MapView is not available
      return (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('location')}</Text>
          <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? colors.border : '#f0f0f0' }]}>
            <Ionicons name="location" size={40} color={colors.primary} />
            <Text style={[styles.mapPlaceholderText, { color: colors.textSecondary }]}>
              {`${event.location.latitude.toFixed(6)}, ${event.location.longitude.toFixed(6)}`}
            </Text>
            <Text style={[styles.mapPlaceholderSubtext, { color: colors.textTertiary }]}>
              Map view is not available on this platform
            </Text>
          </View>
        </>
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.card, 
        borderBottomColor: colors.border,
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('eventDetails')}</Text>
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(event)}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorited ? colors.error : colors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {event.images && event.images.length > 0 ? (
          <Image 
            source={{ uri: event.images[0].url }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: isDark ? colors.border : '#f0f0f0' }]}>
            <Ionicons name="image-outline" size={60} color={colors.textTertiary} />
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>No image available</Text>
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <Text style={[styles.eventName, { color: colors.text }]}>{event.name}</Text>
          
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={colors.textSecondary} 
              style={[styles.infoIcon, isRTL && styles.infoIconRTL]} 
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {event.dates && event.dates.start ? formatDate(event.dates.start.dateTime) : 'Date not available'}
            </Text>
          </View>
          
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons 
              name="location-outline" 
              size={20} 
              color={colors.textSecondary} 
              style={[styles.infoIcon, isRTL && styles.infoIconRTL]} 
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {event._embedded && event._embedded.venues && event._embedded.venues[0] 
                ? `${event._embedded.venues[0].name}, ${event._embedded.venues[0].city.name}` 
                : 'Location not available'}
            </Text>
          </View>
          
          {event.priceRanges && (
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons 
                name="pricetag-outline" 
                size={20} 
                color={colors.textSecondary} 
                style={[styles.infoIcon, isRTL && styles.infoIconRTL]} 
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {`${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`}
              </Text>
            </View>
          )}
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('description')}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {event.info || event.description || 'No description available for this event.'}
          </Text>
          
          {/* Render map or fallback */}
          {renderMap()}
          
          <TouchableOpacity 
            style={[styles.buyButton, { backgroundColor: colors.primary }]}
            onPress={handleBuyTickets}
          >
            <Text style={styles.buyButtonText}>{t('buyTickets')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
  },
  contentContainer: {
    padding: 16,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoIconRTL: {
    marginRight: 0,
    marginLeft: 10,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
  },
  mapPlaceholderText: {
    fontSize: 14,
    marginTop: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  buyButton: {
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});