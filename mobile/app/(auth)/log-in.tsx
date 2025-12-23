import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useState } from 'react'
import { Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import ErrorBanner from '../components/ErrorBanner';
import { extractErrorMessage } from '../../src/utils/extractErrorMessage';

const Login = () => {
    const router = useRouter();
    const loggedIn = useAuthStore((state: any) => state.loggedIn);
    const login = useAuthStore((state: any) => state.login);
    const loading = useAuthStore((state: any) => state.loading);

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (loggedIn) return <Redirect href="/(tabs)" />;

    const onSubmit = async () => {
        setError(null);

        if (!password || !email) {
            setError('Please enter your email and password');
            return;
        }

        try {
            await login({ email, password, role });
        } catch (e: any) {
            const parsed = extractErrorMessage(e);
            setError(parsed);
        }
    }

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: undefined }}
        >
            <View className="flex-1 bg-primary">
                {/* Top hero */}
                <View className="h-48 justify-end px-6 pb-6">
                    <Text className="text-4xl text-textPrimary font-bold">Get Started now</Text>
                    <Text className="text-textSecondary mt-1">Create an account or log in to explore</Text>
                </View>

                {/* Card */}
                <View className="flex-1 bg-white rounded-t-3xl p-6">
                    <View className="bg-gray-100 rounded-2xl p-1 flex-row w-full mx-auto">
                        <TouchableOpacity onPress={() => router.push('/(auth)/log-in')} className="flex-1 py-3 rounded-2xl bg-white items-center">
                            <Text className="text-lg font-semibold text-textPrimary">Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')} className="flex-1 py-3 rounded-2xl items-center">
                            <Text className="text-lg text-textSecondary">Register</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-6">
                        <Text className="text-sm text-black font-bold mb-2">Email address</Text>
                        <TextInput value={email} onChangeText={setEmail} placeholder="example@gmail.com" keyboardType="email-address" autoCapitalize="none" className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-4 placeholder:text-textSecondary" />

                        <Text className="text-sm text-black font-bold mb-2">Password</Text>
                        <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-4 placeholder:text-textSecondary" />

                        <Text className="text-sm text-black font-bold mb-2">Role</Text>
                        <View className="flex-row mb-4">
                            <TouchableOpacity onPress={() => setRole('STUDENT')} className={`flex-1 h-10 rounded-md items-center justify-center mr-2 ${role === 'STUDENT' ? 'bg-textPrimary' : 'bg-[#F3F4F6]'}`}>
                                <Text className={`${role === 'STUDENT' ? 'text-primary font-bold' : 'text-textSecondary'}`}>STUDENT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setRole('HOD')} className={`flex-1 h-10 rounded-md items-center justify-center mr-2 ${role === 'HOD' ? 'bg-textPrimary' : 'bg-[#F3F4F6]'}`}>
                                <Text className={`${role === 'HOD' ? 'text-primary font-bold' : 'text-textSecondary'}`}>HOD</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setRole('PROFESSOR')} className={`flex-1 h-10 rounded-md items-center justify-center ${role === 'PROFESSOR' ? 'bg-textPrimary' : 'bg-[#F3F4F6]'}`}>
                                <Text className={`${role === 'PROFESSOR' ? 'text-primary font-bold' : 'text-textSecondary'}`}>PROFESSOR</Text>
                            </TouchableOpacity>
                        </View>

                        <ErrorBanner message={error} onClose={() => setError(null)} />

                        <TouchableOpacity onPress={onSubmit} className="bg-textPrimary h-12 rounded-full items-center justify-center mt-4">
                            {loading ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <Text className="text-primary font-bold text-lg">Login</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    )
}

export default Login