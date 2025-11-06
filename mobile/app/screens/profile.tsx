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


        <View className='items-center mb-8'>
          <View className='w-28 h-28 rounded-full bg-accent justify-center items-center mb-4'>
            {userData?.name ? (
              <Text className='text-white text-3xl font-bold'>
                {userData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={48} color="white" />
            )}
          </View>
          <Text className='text-white text-2xl font-bold'>
            {userData?.name || 'Student'}
          </Text>
          <Text className='text-textSecondary text-sm mt-1.5'>
            {userData?.email || 'Not provided'}
          </Text>
        </View>


        <Text className='text-textPrimary text-2xl ml-1.5 font-bold'>Academic Details</Text>

        <View className='bg-secondary rounded-xl p-6 mt-5'>

          <View className='flex-row items-center mb-5'>
            <Ionicons className='p-2.5 bg-accent rounded-xl' name="school-outline" size={22} color="white" />
            <Text className='text-textSecondary ml-2'> Enrollment No: {userData?.enrollment_no || 'Not provided'}</Text>
          </View>

          <View className="mx-5 border-b border-[#29313C]" />

          <View className='flex-row items-center mb-5 mt-5'>
            <Ionicons className='p-2.5 bg-accent rounded-xl' name="book-outline" size={22} color="white" />
            <Text className='text-textSecondary ml-2'> Department: {userData?.department || 'Not provided'}</Text>
          </View>

          <View className="mx-5 border-b border-[#29313C]" />

          <View className='flex-row items-center mb-5 mt-5'>
            <Ionicons className='p-2.5 bg-accent rounded-xl' name="call-outline" size={22} color="white" />
            <Text className='text-textSecondary ml-2'> Mobile No: {userData?.mobile_no || 'Not provided'}</Text>
          </View>

          <View className="mx-5 border-b border-[#29313C]" />

          <View className='flex-row items-center mb-5 mt-5'>
            <Ionicons className='p-2.5 bg-accent rounded-xl' name="person-outline" size={22} color="white" />
            <Text className='text-textSecondary ml-2'> Role: {userData?.role || 'Not provided'}</Text>
          </View>

        </View>



        <Text className='text-textPrimary my-5 text-2xl ml-1.5 font-bold'>Attendance</Text>

            
            



        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className='bg-red-500 mt-8 px-6 py-4 rounded-xl flex-row items-center mb-5 justify-center'
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