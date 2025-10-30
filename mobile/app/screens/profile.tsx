import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import useAuthStore from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {

  const logout = useAuthStore((state) => state.logout);
  const userData = useAuthStore((state) => state.userData);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/log-in');
  };

  return (
    <ScrollView className='bg-primary h-full w-full'>
      <View className='px-6 pt-10'>
        {/* Profile Header */}
        <View className='items-center mb-8'>
          <View className='w-24 h-24 rounded-full bg-accent justify-center items-center mb-4'>
            <Ionicons name="person" size={48} color="white" />
          </View>
          <Text className='text-white text-2xl font-bold'>
            {userData?.name || 'Student'}
          </Text>
          <Text className='text-textSecondary text-sm mt-1'>
            {userData?.email}
          </Text>
        </View>

        {/* Profile Information Cards */}
        <View className='space-y-4'>
          {/* Email Card */}
          <View className='bg-secondary rounded-xl p-4 border border-textPrimary/20'>
            <View className='flex-row items-center mb-2'>
              <Ionicons name="mail-outline" size={20} color="#00FF88" />
              <Text className='text-textPrimary text-sm font-semibold ml-2'>Email</Text>
            </View>
            <Text className='text-white text-base ml-7'>{userData?.email || 'N/A'}</Text>
          </View>

          {/* Enrollment Card */}
          {userData?.enrollment_no && (
            <View className='bg-secondary rounded-xl p-4 border border-textPrimary/20'>
              <View className='flex-row items-center mb-2'>
                <Ionicons name="id-card-outline" size={20} color="#00FF88" />
                <Text className='text-textPrimary text-sm font-semibold ml-2'>Enrollment Number</Text>
              </View>
              <Text className='text-white text-base ml-7'>{userData.enrollment_no}</Text>
            </View>
          )}

          {/* User ID Card */}
          {userData?.id && (
            <View className='bg-secondary rounded-xl p-4 border border-textPrimary/20'>
              <View className='flex-row items-center mb-2'>
                <Ionicons name="key-outline" size={20} color="#00FF88" />
                <Text className='text-textPrimary text-sm font-semibold ml-2'>User ID</Text>
              </View>
              <Text className='text-white text-base ml-7'>{userData.id}</Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout} 
          className='bg-red-500 mt-8 px-6 py-4 rounded-xl flex-row items-center justify-center'
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className='text-white text-lg font-bold ml-2'>Log Out</Text>
        </TouchableOpacity>

        <Text className='text-center text-textSecondary text-xs mt-8 mb-6'>
          College Buddy v1.0.0
        </Text>
      </View>
    </ScrollView>
  )
}

export default Profile