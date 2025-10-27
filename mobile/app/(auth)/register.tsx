import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useState } from 'react'
import { Redirect, useRouter } from 'expo-router';
import useAuthStore from '../store/authStore';

const Signin = () => {
  const router = useRouter();
  const isLoggedin = useAuthStore((state: any) => state.isLoggedin);
  const register = useAuthStore((state: any) => state.register);
  const loading = useAuthStore((state: any) => state.loading);

  const [name, setName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isLoggedin) return <Redirect href="/(tabs)" />;

  const onRegister = async () => {
    setError(null);
    if (!email || !password || !name) {
      setError('Please fill all fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, enrollment, password);
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    }
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} enableOnAndroid keyboardShouldPersistTaps="handled" extraScrollHeight={20}>
      <View className="flex-1 bg-primary">
        <View className="h-48 justify-end px-6 pb-6">
          <Text className="text-4xl text-textPrimary font-bold">Get Started now</Text>
          <Text className="text-textSecondary mt-1">Create an account or log in to explore</Text>
        </View>

        <View className="flex-1 bg-white rounded-t-3xl p-6">
          <View className="bg-gray-100 rounded-2xl p-1 flex-row w-full mx-auto">
            <TouchableOpacity onPress={() => router.push('/(auth)/log-in')} className="flex-1 py-3 rounded-2xl items-center">
              <Text className="text-lg text-textSecondary">Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} className="flex-1 py-3 rounded-2xl bg-white items-center">
              <Text className="text-lg font-semibold text-textPrimary">Register</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6">
            <Text className="text-sm text-black mb-2 font-bold">Full name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="name surname" className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-4 placeholder:text-textSecondary" />

            <Text className="text-sm text-black mb-2 font-bold">Enrollment number</Text>
            <TextInput value={enrollment} onChangeText={setEnrollment} placeholder="enrollment number" className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-4 placeholder:text-textSecondary" />

            <Text className="text-sm text-black mb-2 font-bold">Email address</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="example@gmail.com" keyboardType="email-address" autoCapitalize="none" className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-4 placeholder:text-textSecondary" />

            <Text className="text-sm text-black mb-2 font-bold">Password</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-4 placeholder:text-textSecondary" />

            <Text className="text-sm text-black mb-2 font-bold">Confirm password</Text>
            <TextInput value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-4 placeholder:text-textSecondary" />

            {error && <Text className="text-red-500 mb-2">{error}</Text>}

            <TouchableOpacity onPress={onRegister} className="bg-textPrimary h-12 rounded-full items-center justify-center mt-4">
              {loading ? <ActivityIndicator color="black" /> : <Text className="text-primary font-bold text-lg">Register</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default Signin