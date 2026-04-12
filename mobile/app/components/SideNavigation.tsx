import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import colors from '@/src/config/colors';
import { useSideNavStore } from '@/src/store/sideNavStore';
import { useAuthStore } from '@/src/store/authStore';

const SideNavigation: React.FC = () => {
  const router = useRouter();
  const isOpen = useSideNavStore((state) => state.isOpen);
  const closeSideNav = useSideNavStore((state) => state.closeSideNav);
  const userData = useAuthStore((state) => state.userData);
  const userRole = userData?.role;

  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const blurAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      // Reset values before opening
      slideAnim.setValue(300);
      blurAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, blurAnim]);

  const adminItems = [
    { label: 'Dashboard', icon: 'grid', route: '/(admin)' },
    { label: 'Divisions', icon: 'git-branch', route: '/(admin)/divisionHandler' },
    { label: 'Subjects', icon: 'book', route: '/(admin)/SubjectHandler' },
    { label: 'Requests', icon: 'clipboard', route: '/(admin)/requestHandle' },
  ];

  const studentItems = [
    { label: 'Dashboard', icon: 'grid', route: '/(student)' },
    { label: 'Subjects', icon: 'book', route: '/(student)/Subjects' },
    { label: 'Assignments', icon: 'document-text', route: '/(student)/Assignments' },
    { label: 'Attendance', icon: 'checkmark-circle', route: '/(student)/Attendence' },
  ];

  const handleNavigation = (route: string) => {
    closeSideNav();
    router.push(route as any);
  };

  // Determine which items to show based on role
  const isAdmin = userRole === 'PROFESSOR' || userRole === 'HOD';
  const isStudent = userRole === 'STUDENT';

  if (!isOpen) return null;

  return (
    <SafeAreaView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 999,
      }}
    >
      {/* Blur Overlay */}
      <Animated.View style={{ flex: 1, opacity: blurAnim }}>
        <BlurView intensity={80} tint="dark" style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeSideNav} />
        </BlurView>
      </Animated.View>

      {/* Side Drawer */}
      <Animated.View
        style={{
          width: '75%',
          backgroundColor: colors.secondary,
          transform: [{ translateX: slideAnim }],
        }}
      >
        <SafeAreaView className='pt-14' style={{ flex: 1 }}>
          {/* Header */}
          <View className='pt-10 flex-row justify-between pr-7' style={{ paddingHorizontal: 16, marginBottom: 24, paddingTop: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.textWhite }}>
              Menu
            </Text>
            <TouchableOpacity onPress={closeSideNav} style={{ marginBottom: 12 }}>
              <Ionicons name="close" size={28} color={colors.accentBright} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
            {/* Admin Section - Show if user is Professor or HOD */}
            {isAdmin && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.textDim, fontSize: 12, marginBottom: 10, fontWeight: '600' }}>
                  ADMIN
                </Text>
                {adminItems.map((item, index) => (
                  <TouchableOpacity
                    key={`admin-${index}`}
                    onPress={() => handleNavigation(item.route)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                      backgroundColor: colors.overlayLight,
                    }}
                  >
                    <Ionicons name={item.icon as any} size={20} color={colors.accentBright} />
                    <Text style={{ color: colors.textWhite, fontSize: 14 }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Student Section - Show if user is Student */}
            {isStudent && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.textDim, fontSize: 12, marginBottom: 10, fontWeight: '600' }}>
                  STUDENT
                </Text>
                {studentItems.map((item, index) => (
                  <TouchableOpacity
                    key={`student-${index}`}
                    onPress={() => handleNavigation(item.route)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                      backgroundColor: colors.overlayLight,
                    }}
                  >
                    <Ionicons name={item.icon as any} size={20} color={colors.accentBright} />
                    <Text style={{ color: colors.textWhite, fontSize: 14 }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default SideNavigation;