import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '../hooks/useTheme.tsx';
import { useLanguage } from '../hooks/useLanguage.tsx';

export const EventCard = ({ event, isFavorite, onToggleFavorite, onPress }) => {
  const { colors, isDark } = useTheme();
  const { isRTL } = useLanguage();
  
  // Format date
  const formattedDate = event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'Date TBA';
  
  return (
    <TouchableOpacity 
      style={[styles.card, { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }]}
      onPress={onPress}
    >
      <Image 
        source={{ uri: event.imageUrl || `https://api.a0.dev/assets/image?text=${encodeURIComponent(event.name)}&aspect=1:1&seed=${isDark ? 'dark' : 'light'}` }} 
        style={styles.image} 
      />
      
      <View style={[styles.content, { paddingLeft: isRTL ? 0 : 12, paddingRight: isRTL ? 12 : 0 }]}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {event.name}
        </Text>
        
        <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { 
            color: colors.textSecondary,
            marginLeft: isRTL ? 0 : 4,
            marginRight: isRTL ? 4 : 0
          }]}>
            {formattedDate}
          </Text>
        </View>
        
        <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { 
            color: colors.textSecondary,
            marginLeft: isRTL ? 0 : 4,
            marginRight: isRTL ? 4 : 0
          }]} numberOfLines={1}>
            {event.venue || event.city || 'Location TBA'}
          </Text>
        </View>
        
        <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? colors.error : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 100,
    height: 120,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  favoriteButton: {
    padding: 4,
  },
});