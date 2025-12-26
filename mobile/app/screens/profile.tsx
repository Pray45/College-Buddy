import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useMemo } from 'react'
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {

  const logout = useAuthStore((state) => state.logout);
  const userData = useAuthStore((state) => state.userData);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/log-in');
  };

  // Extract role-specific data
  const roleData = useMemo(() => {
    if (!userData?.role) return {};
    
    if (userData.role === 'STUDENT') {
      return {
        enrollmentNo: userData.enrollmentNo,
        semester: userData.semester,
        division: userData.division,
        subjects: userData.subjects,
        savedNotes: userData.savednotes,
      };
    }
    
    if (userData.role === 'PROFESSOR') {
      return {
        teacherId: userData.teacherId,
        position: userData.position,
      };
    }
    
    if (userData.role === 'HOD') {
      return {};
    }
    
    return {};
  }, [userData]);

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
            {userData?.name || 'User'}
          </Text>
          <Text className='text-textSecondary text-sm mt-1.5'>
            {userData?.email || 'Not provided'}
          </Text>
          <Text className='text-accent text-xs mt-2 font-semibold'>
            {userData?.role || 'N/A'} • {userData?.verificationStatus || 'PENDING'}
          </Text>
        </View>


        {/* Basic Info */}
        <Text className='text-textPrimary text-lg ml-1.5 font-bold'>Basic Information</Text>
        <View className='bg-secondary rounded-xl p-4 mt-3 mb-5'>
          <View className='flex-row items-center mb-4'>
            <Ionicons className='p-2 bg-accent rounded-lg' name="person-outline" size={20} color="white" />
            <View className='flex-1 ml-3'>
              <Text className='text-textSecondary text-xs'>Role</Text>
              <Text className='text-textPrimary font-semibold'>{userData?.role || 'Not provided'}</Text>
            </View>
          </View>
          
          <View className="mx-0 border-b border-[#29313C]" />
          
          <View className='flex-row items-center my-4'>
            <Ionicons className='p-2 bg-accent rounded-lg' name="shield-checkmark-outline" size={20} color="white" />
            <View className='flex-1 ml-3'>
              <Text className='text-textSecondary text-xs'>Verification Status</Text>
              <Text className='text-textPrimary font-semibold'>{userData?.verificationStatus || 'PENDING'}</Text>
            </View>
          </View>

          <View className="mx-0 border-b border-[#29313C]" />

          <View className='flex-row items-center mt-4'>
            <Ionicons className='p-2 bg-accent rounded-lg' name="business-outline" size={20} color="white" />
            <View className='flex-1 ml-3'>
              <Text className='text-textSecondary text-xs'>Department</Text>
              <Text className='text-textPrimary font-semibold'>{userData?.department || 'Not provided'}</Text>
            </View>
          </View>
        </View>


        {/* Student-specific details */}
        {userData?.role === 'STUDENT' && (
          <>
            <Text className='text-textPrimary text-lg ml-1.5 font-bold'>Academic Details</Text>
            <View className='bg-secondary rounded-xl p-4 mt-3 mb-5'>
              <View className='flex-row items-center mb-4'>
                <Ionicons className='p-2 bg-accent rounded-lg' name="school-outline" size={20} color="white" />
                <View className='flex-1 ml-3'>
                  <Text className='text-textSecondary text-xs'>Enrollment Number</Text>
                  <Text className='text-textPrimary font-semibold'>{userData.enrollmentNo || 'Not provided'}</Text>
                </View>
              </View>

              <View className="mx-0 border-b border-[#29313C]" />

              <View className='flex-row items-center my-4'>
                <Ionicons className='p-2 bg-accent rounded-lg' name="layers-outline" size={20} color="white" />
                <View className='flex-1 ml-3'>
                  <Text className='text-textSecondary text-xs'>Semester</Text>
                  <Text className='text-textPrimary font-semibold'>{userData.semester || 'Not assigned'}</Text>
                </View>
              </View>

              <View className="mx-0 border-b border-[#29313C]" />

              <View className='flex-row items-center my-4'>
                <Ionicons className='p-2 bg-accent rounded-lg' name="git-branch-outline" size={20} color="white" />
                <View className='flex-1 ml-3'>
                  <Text className='text-textSecondary text-xs'>Division</Text>
                  <Text className='text-textPrimary font-semibold'>{userData.division || 'Not assigned'}</Text>
                </View>
              </View>

              {userData.subjects && userData.subjects.length > 0 && (
                <>
                  <View className="mx-0 border-b border-[#29313C]" />
                  <View className='flex-row items-start my-4'>
                    <Ionicons className='p-2 bg-accent rounded-lg' name="book-outline" size={20} color="white" />
                    <View className='flex-1 ml-3'>
                      <Text className='text-textSecondary text-xs'>Subjects ({userData.subjects.length})</Text>
                      {userData.subjects.map((subject: string, idx: number) => (
                        <Text key={idx} className='text-textPrimary font-semibold text-sm mt-1'>
                          • {subject}
                        </Text>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {userData.savednotes && userData.savednotes.length > 0 && (
                <>
                  <View className="mx-0 border-b border-[#29313C]" />
                  <View className='flex-row items-center mt-4'>
                    <Ionicons className='p-2 bg-accent rounded-lg' name="bookmark-outline" size={20} color="white" />
                    <View className='flex-1 ml-3'>
                      <Text className='text-textSecondary text-xs'>Saved Notes</Text>
                      <Text className='text-textPrimary font-semibold'>{userData.savednotes.length} notes</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </>
        )}


        {/* Professor-specific details */}
        {userData?.role === 'PROFESSOR' && (
          <>
            <Text className='text-textPrimary text-lg ml-1.5 font-bold'>Professional Details</Text>
            <View className='bg-secondary rounded-xl p-4 mt-3 mb-5'>
              <View className='flex-row items-center mb-4'>
                <Ionicons className='p-2 bg-accent rounded-lg' name="card-outline" size={20} color="white" />
                <View className='flex-1 ml-3'>
                  <Text className='text-textSecondary text-xs'>Teacher ID</Text>
                  <Text className='text-textPrimary font-semibold'>{userData.teacherId || 'Not provided'}</Text>
                </View>
              </View>

              <View className="mx-0 border-b border-[#29313C]" />

              <View className='flex-row items-center mt-4'>
                <Ionicons className='p-2 bg-accent rounded-lg' name="briefcase-outline" size={20} color="white" />
                <View className='flex-1 ml-3'>
                  <Text className='text-textSecondary text-xs'>Position</Text>
                  <Text className='text-textPrimary font-semibold'>{userData.position || 'Not assigned'}</Text>
                </View>
              </View>
            </View>
          </>
        )}


        {/* HOD-specific message */}
        {userData?.role === 'HOD' && (
          <>
            <Text className='text-textPrimary text-lg ml-1.5 font-bold'>Department Leadership</Text>
            <View className='bg-secondary rounded-xl p-4 mt-3 mb-5'>
              <Text className='text-textSecondary'>You are the Head of Department for {userData.department}</Text>
            </View>
          </>
        )}

            
            



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