import { useState, useEffect, createContext, useContext } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define language types
export type LanguageType = 'en' | 'ar';

// Define translations
export const translations = {
  en: {
    appName: 'City Pulse',
    tagline: 'Local Events Explorer',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    search: 'Search',
    events: 'Events',
    noEvents: 'No events found',
    tryDifferent: 'Try different search terms',
    discover: 'Discover Local Events',
    searchPrompt: 'Search for events by keyword and city',
    profile: 'Profile',
    settings: 'Settings',
    rtlLayout: 'RTL Layout',
    darkMode: 'Dark Mode',
    systemTheme: 'Use System Theme',
    logout: 'Logout',
    favorites: 'Favorite Events',
    noFavorites: 'No favorite events yet',
    favoritePrompt: 'Events you mark as favorites will appear here',
    biometricLogin: 'Login with Biometrics',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account? Login',
    newUser: 'New user? Create account',
    eventDetails: 'Event Details',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    description: 'Description',
    buyTickets: 'Buy Tickets',
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    changeLanguage: 'Change Language',
    languageChangePrompt: 'The app will restart to apply the new language.',
    cancel: 'Cancel',
    ok: 'OK',
    languageChanged: 'Language Changed',
    languageChangeSuccess: 'The app is now in English',
    layoutDirection: 'Layout Direction',
    layoutChanged: 'Layout Changed',
    layoutChangeSuccess: 'The app is now in LTR mode',
  },
  ar: {
    appName: 'نبض المدينة',
    tagline: 'مستكشف الفعاليات المحلية',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    search: 'بحث',
    events: 'الفعاليات',
    noEvents: 'لم يتم العثور على فعاليات',
    tryDifferent: 'جرب كلمات بحث مختلفة',
    discover: 'اكتشف الفعاليات المحلية',
    searchPrompt: 'ابحث عن الفعاليات حسب الكلمة الرئيسية والمدينة',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    rtlLayout: 'تخطيط من اليمين إلى اليسار',
    darkMode: 'الوضع المظلم',
    systemTheme: 'استخدام سمة النظام',
    logout: 'تسجيل الخروج',
    favorites: 'الفعاليات المفضلة',
    noFavorites: 'لا توجد فعاليات مفضلة حتى الآن',
    favoritePrompt: 'ستظهر هنا الفعاليات التي تضيفها للمفضلة',
    biometricLogin: 'تسجيل الدخول باستخدام المقاييس الحيوية',
    welcomeBack: 'مرحبًا بعودتك',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟ تسجيل الدخول',
    newUser: 'مستخدم جديد؟ إنشاء حساب',
    eventDetails: 'تفاصيل الفعالية',
    date: 'التاريخ',
    time: 'الوقت',
    location: 'الموقع',
    description: 'الوصف',
    buyTickets: 'شراء التذاكر',
    language: 'اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    changeLanguage: 'تغيير اللغة',
    languageChangePrompt: 'سيتم إعادة تشغيل التطبيق لتطبيق اللغة الجديدة.',
    cancel: 'إلغاء',
    ok: 'موافق',
    languageChanged: 'تم تغيير اللغة',
    languageChangeSuccess: 'التطبيق الآن باللغة العربية',
    layoutDirection: 'اتجاه التخطيط',
    layoutChanged: 'تم تغيير التخطيط',
    layoutChangeSuccess: 'التطبيق الآن في وضع RTL',
  },
};

// Create context
type LanguageContextType = {
  language: LanguageType;
  isRTL: boolean;
  t: (key: keyof typeof translations.en) => string;
  setLanguage: (language: LanguageType) => void;
  toggleRTL: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>('en');
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  
  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) {
          setLanguageState(savedLanguage as LanguageType);
          
          // Set RTL based on language
          if (savedLanguage === 'ar' && !I18nManager.isRTL) {
            I18nManager.forceRTL(true);
            setIsRTL(true);
          } else if (savedLanguage === 'en' && I18nManager.isRTL) {
            I18nManager.forceRTL(false);
            setIsRTL(false);
          }
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      }
    };
    
    loadLanguage();
  }, []);
  
  // Save language preference and update RTL when language changes
  const setLanguage = async (newLanguage: LanguageType) => {
    try {
      await AsyncStorage.setItem('language', newLanguage);
      setLanguageState(newLanguage);
      
      // Set RTL based on language
      if (newLanguage === 'ar' && !I18nManager.isRTL) {
        I18nManager.forceRTL(true);
        setIsRTL(true);
      } else if (newLanguage === 'en' && I18nManager.isRTL) {
        I18nManager.forceRTL(false);
        setIsRTL(false);
      }
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };
  
  // Toggle RTL manually
  const toggleRTL = async () => {
    try {
      const newIsRTL = !isRTL;
      I18nManager.forceRTL(newIsRTL);
      setIsRTL(newIsRTL);
      
      // Update language based on RTL
      if (newIsRTL && language !== 'ar') {
        await AsyncStorage.setItem('language', 'ar');
        setLanguageState('ar');
      } else if (!newIsRTL && language !== 'en') {
        await AsyncStorage.setItem('language', 'en');
        setLanguageState('en');
      }
    } catch (error) {
      console.error('Failed to toggle RTL:', error);
    }
  };
  
  // Translation function
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, isRTL, t, setLanguage, toggleRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};