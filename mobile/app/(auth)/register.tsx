import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useState, useCallback } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

type Role = 'STUDENT' | 'PROFESSOR';
type Department = 'CSE' | 'ECE' | 'ME' | 'EE' | 'CE';

interface FormErrors {
  name?: string;
  email?: string;
  enrollment?: string;
  teacherId?: string;
  password?: string;
  confirm?: string;
}

// Constants
const DEPARTMENTS = [
  { label: 'Computer Science & Engineering', value: 'CSE' },
  { label: 'Electronics & Communication Engineering', value: 'ECE' },
  { label: 'Mechanical Engineering', value: 'ME' },
  { label: 'Electrical Engineering', value: 'EE' },
  { label: 'Civil Engineering', value: 'CE' },
] as const;

const Register = () => {
  const router = useRouter();
  const loggedIn = useAuthStore((state: any) => state.loggedIn);
  const register = useAuthStore((state: any) => state.register);
  const loading = useAuthStore((state: any) => state.loading);

  // Form state
  const [role, setRole] = useState<Role>('STUDENT');
  const [name, setName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [department, setDepartment] = useState<Department>('CSE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const isTwelveDigits = (val: string) => /^\d{12}$/.test(val);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!validateName(name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    if (role === 'STUDENT') {
      const value = enrollment.trim();
      if (!value) {
        newErrors.enrollment = 'Enrollment number is required';
      } else if (!isTwelveDigits(value)) {
        newErrors.enrollment = 'Enrollment number must be exactly 12 digits';
      }
    }

    if (role === 'PROFESSOR') {
      const value = teacherId.trim();
      if (!value) {
        newErrors.teacherId = 'Teacher ID is required';
      } else if (!isTwelveDigits(value)) {
        newErrors.teacherId = 'Teacher ID must be exactly 12 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, confirm, role, enrollment, teacherId]);

  // Early return after all hooks
  if (loggedIn) return <Redirect href="/(tabs)" />;

  const onRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        department,
        enrollmentNo: role === 'STUDENT' ? enrollment.trim() : undefined,
        teacherId: role === 'PROFESSOR' ? teacherId.trim() : undefined,
      });
    } catch (e: any) {
      Alert.alert(
        'Registration Failed',
        e?.message || 'An error occurred during registration. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setErrors({});
  };

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
        <View className="h-48 justify-end px-6 pb-6">
          <Text className="text-4xl text-textPrimary font-bold">Get Started Now</Text>
          <Text className="text-textSecondary mt-1">Create an account or log in to explore</Text>
        </View>

        <View className="flex-1 bg-white rounded-t-3xl p-6">
          {/* Tab Switcher */}
          <View className="bg-gray-100 rounded-2xl p-1 flex-row w-full mx-auto">
            <TouchableOpacity
              onPress={() => router.push('/(auth)/log-in')}
              className="flex-1 py-3 rounded-2xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-lg text-textSecondary">Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="flex-1 py-3 rounded-2xl bg-white items-center"
              activeOpacity={0.7}
            >
              <Text className="text-lg font-semibold text-textPrimary">Register</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6">
            {/* Role Picker */}
            <Text className="text-sm text-black mb-2 font-bold">Role</Text>
            <View className="bg-[#F3F4F6] rounded-md mb-4">
              <Picker selectedValue={role} onValueChange={handleRoleChange}>
                <Picker.Item label="Student" value="STUDENT" />
                <Picker.Item label="Professor" value="PROFESSOR" />
              </Picker>
            </View>

            {/* Full Name */}
            <Text className="text-sm text-black mb-2 font-bold">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="John Doe"
              autoCapitalize="words"
              className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-1 placeholder:text-textSecondary"
            />
            {errors.name && <Text className="text-red-500 text-xs mb-3">{errors.name}</Text>}
            {!errors.name && <View className="mb-3" />}

            {/* Email */}
            <Text className="text-sm text-black mb-2 font-bold">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="example@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-1 placeholder:text-textSecondary"
            />
            {errors.email && <Text className="text-red-500 text-xs mb-3">{errors.email}</Text>}
            {!errors.email && <View className="mb-3" />}

            {/* Department Picker */}
            <Text className="text-sm text-black mb-2 font-bold">Department</Text>
            <View className="bg-[#F3F4F6] rounded-md mb-4">
              <Picker selectedValue={department} onValueChange={(value:any) => setDepartment(value as Department)}>
                {DEPARTMENTS.map((dept) => (
                  <Picker.Item key={dept.value} label={dept.label} value={dept.value} />
                ))}
              </Picker>
            </View>

            {/* Conditional Fields */}
            {role === 'STUDENT' ? (
              <>
                <Text className="text-sm text-black mb-2 font-bold">Enrollment Number</Text>
                <TextInput
                  value={enrollment}
                  onChangeText={(text) => {
                    setEnrollment(text);
                    if (errors.enrollment) setErrors({ ...errors, enrollment: undefined });
                  }}
                  placeholder="Enter enrollment number"
                  keyboardType="number-pad"
                  className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-1 placeholder:text-textSecondary"
                />
                {errors.enrollment && <Text className="text-red-500 text-xs mb-3">{errors.enrollment}</Text>}
                {!errors.enrollment && <View className="mb-3" />}
              </>
            ) : (
              <>
                <Text className="text-sm text-black mb-2 font-bold">Teacher ID</Text>
                <TextInput
                  value={teacherId}
                  onChangeText={(text) => {
                    setTeacherId(text);
                    if (errors.teacherId) setErrors({ ...errors, teacherId: undefined });
                  }}
                  placeholder="Enter employee ID"
                  keyboardType="number-pad"
                  className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-1 placeholder:text-textSecondary"
                />
                {errors.teacherId && <Text className="text-red-500 text-xs mb-3">{errors.teacherId}</Text>}
                {!errors.teacherId && <View className="mb-3" />}
              </>
            )}

            {/* Password */}
            <Text className="text-sm text-black mb-2 font-bold">Password</Text>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-1 placeholder:text-textSecondary"
            />
            {errors.password && <Text className="text-red-500 text-xs mb-3">{errors.password}</Text>}
            {!errors.password && <View className="mb-3" />}

            {/* Confirm Password */}
            <Text className="text-sm text-black mb-2 font-bold">Confirm Password</Text>
            <TextInput
              value={confirm}
              onChangeText={(text) => {
                setConfirm(text);
                if (errors.confirm) setErrors({ ...errors, confirm: undefined });
              }}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              className="bg-[#F3F4F6] px-4 h-12 rounded-md mb-1 placeholder:text-textSecondary"
            />
            {errors.confirm && <Text className="text-red-500 text-xs mb-3">{errors.confirm}</Text>}
            {!errors.confirm && <View className="mb-3" />}

            {/* Register Button */}
            <TouchableOpacity
              onPress={onRegister}
              disabled={loading}
              className={`bg-textPrimary h-12 rounded-full items-center justify-center mt-4 ${loading ? 'opacity-50' : ''}`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text className="text-primary font-bold text-lg">Register</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Register;