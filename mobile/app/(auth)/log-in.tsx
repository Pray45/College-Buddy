import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const Login = () => {

    const isLoggedin = useAuthStore((state) => state.isLoggedin);

    if (isLoggedin) return <Redirect href="/(tabs)" />;

    return (
        <View className='bg-primary w-full h-full justify-center items-center'>
            <Text className='text-3xl text-textPrimary'>Login To College Buddy</Text>
            <View className='mt-4 p-4 bg-secondary rounded-lg'>
                <TextInput placeholder='Email' className='bg-primary text-textPrimary w-64 h-12 px-4 rounded-md mb-4' />
                <TextInput placeholder='Password' secureTextEntry={true} className='bg-primary text-textPrimary w-64 h-12 px-4 rounded-md mb-4' />
                <View className='bg-accent w-64 h-12 rounded-md justify-center items-center'>
                    <Text className='text-white text-lg font-semibold'>Login</Text>
                </View>
            </View>
        </View>
    )
}

export default Login