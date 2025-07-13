import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

export default function ProfileScreen() {
  const { user, userProfile, logout, enableBiometricLogin, disableBiometricLogin } = useAuth();
  const { profileImage, userName, userEmail, setUserName, setProfileImage, uploadProfileImage } = useUserProfile();
  const { colors, isDark, setTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForBiometric, setPasswordForBiometric] = useState('');

  useEffect(() => {
    // Check if biometric login is enabled
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      // Check if biometric password is stored
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const storedPassword = await AsyncStorage.getItem('biometricPassword');
      setBiometricEnabled(!!storedPassword);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              const message = error instanceof Error ? error.message : t('somethingWentWrong');
              Alert.alert(t('error'), message);
            }
          },
        },
      ]
    );
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert(t('error'), t('nameCannotBeEmpty'));
      return;
    }

    try {
      await setUserName(tempName.trim());
      setIsEditingName(false);
      setTempName('');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('somethingWentWrong');
      Alert.alert(t('error'), message);
    }
  };

  const handleEditName = () => {
    setTempName(userName || '');
    setIsEditingName(true);
  };

  const handleGenerateProfileImage = async () => {
    try {
      await uploadProfileImage(new Blob());
      Alert.alert(t('success'), t('profileImageUpdated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('somethingWentWrong');
      Alert.alert(t('error'), message);
    }
  };

  const handleBiometricToggle = () => {
    if (biometricEnabled) {
      // Disable biometric login
      Alert.alert(
        t('disableBiometric'),
        t('disableBiometricConfirmation'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('disable'),
            style: 'destructive',
            onPress: async () => {
              try {
                await disableBiometricLogin();
                setBiometricEnabled(false);
                Alert.alert(t('success'), t('biometricDisabled'));
              } catch (error) {
                const message = error instanceof Error ? error.message : t('somethingWentWrong');
                Alert.alert(t('error'), message);
              }
            },
          },
        ]
      );
    } else {
      // Enable biometric login - ask for password
      setShowPasswordModal(true);
    }
  };

  const handleEnableBiometric = async () => {
    if (!passwordForBiometric.trim()) {
      Alert.alert(t('error'), t('passwordRequired'));
      return;
    }

    try {
      await enableBiometricLogin(passwordForBiometric);
      setBiometricEnabled(true);
      setShowPasswordModal(false);
      setPasswordForBiometric('');
      Alert.alert(t('success'), t('biometricEnabled'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('somethingWentWrong');
      Alert.alert(t('error'), message);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text }]}>{t('notLoggedIn')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('profile')}</Text>
        </View>

        {/* Profile Image Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.profileImageContainer}>
            {Platform.OS !== 'web' ? (
              profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.border }]}>
                  <Ionicons name="person" size={50} color={colors.textSecondary} />
                </View>
              )
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.border }]}>
                <Text style={[styles.profileImageText, { color: colors.textSecondary }]}>
                  {t('profileImage')}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.editImageButton, { backgroundColor: colors.primary }]}
              onPress={handleGenerateProfileImage}
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('email')}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userEmail}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('displayName')}</Text>
            {isEditingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: colors.text, borderColor: colors.border }]}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder={t('enterName')}
                  placeholderTextColor={colors.textTertiary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.cancelButton}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameContainer}>
                <Text style={[styles.infoValue, { color: colors.text }]}>{userName || t('notSet')}</Text>
                <TouchableOpacity onPress={handleEditName}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings')}</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleThemeToggle}>
            <Ionicons 
              name={isDark ? "moon" : "sunny"} 
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {isDark ? t('darkMode') : t('lightMode')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageToggle}>
            <Ionicons name="language" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {language === 'en' ? t('english') : t('arabic')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.settingRow} onPress={handleBiometricToggle}>
              <Ionicons name="finger-print" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('biometricLogin')}
              </Text>
              <View style={styles.switchContainer}>
                <Text style={[styles.switchText, { color: biometricEnabled ? colors.primary : colors.textSecondary }]}>
                  {biometricEnabled ? t('enabled') : t('disabled')}
                </Text>
                <Ionicons 
                  name={biometricEnabled ? "toggle" : "toggle-outline"} 
                  size={24} 
                  color={biometricEnabled ? colors.primary : colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error || '#ff4444' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="white" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Password Modal for Biometric Setup */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('enableBiometric')}</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {t('enterPasswordToContinue')}
            </Text>
            
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder={t('password')}
              placeholderTextColor={colors.textTertiary}
              value={passwordForBiometric}
              onChangeText={setPasswordForBiometric}
              secureTextEntry
              textAlign={isRTL ? 'right' : 'left'}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textSecondary }]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordForBiometric('');
                }}
              >
                <Text style={styles.modalButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleEnableBiometric}
              >
                <Text style={styles.modalButtonText}>{t('enable')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: 12,
    textAlign: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    textAlign: 'right',
  },
  nameContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  editContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  saveButton: {
    marginRight: 5,
  },
  cancelButton: {
    marginLeft: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLabel: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    marginRight: 10,
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});