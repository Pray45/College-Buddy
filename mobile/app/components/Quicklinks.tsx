import { View, Text, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/build/Ionicons'

const Quicklinks = () => {
    return (
        <>
            <View className="mt-10 flex-row ml-8 gap-3">
                <Ionicons name="link-outline" size={28} color="white" />
                <Text className="text-textTheme text-2xl font-semibold">
                    Quick Links
                </Text>
            </View>

            <View className="flex-row mx-5 flex-wrap mt-5 items-center justify-center gap-5 mb-10">

                <TouchableOpacity onPress={() => (Linking.openURL('https://www.gecpatan.ac.in'))} className="w-[45%] h-40 bg-secondary border-[0.2px] border-textPrimary rounded-xl justify-center items-center gap-2">
                    <Ionicons name="earth" size={50} color="white" />
                    <Text className="text-lg font-semibold text-textSecondary text-center mt-1">GECP Website</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => (Linking.openURL('https://gtu.ac.in/syllabus/syllabus.aspx'))} className="w-[45%] h-40 bg-secondary border-[0.2px] border-textPrimary rounded-xl justify-center items-center gap-2">
                    <Ionicons name="book-outline" size={50} color="white" />
                    <Text className="text-lg font-semibold text-textSecondary text-center">Syllabus Page</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => (Linking.openURL('https://gecpatan.ac.in/StudentCorner/StudentClubs'))} className="w-[45%] h-40 bg-secondary border-[0.2px] border-textPrimary rounded-xl justify-center items-center gap-2">
                    <Ionicons name="people-outline" size={50} color="white" />
                    <Text className="text-lg font-semibold text-textSecondary text-center"> GECP Clubs </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => (Linking.openURL('https://www.student.gtu.ac.in/Login.aspx'))} className="w-[45%] h-40 bg-secondary border-[0.2px] border-textPrimary rounded-xl justify-center items-center gap-2">
                    <Ionicons name="globe-outline" size={50} color="white" />
                    <Text className="text-lg font-semibold text-textSecondary text-center">StudentPortal</Text>
                </TouchableOpacity>

            </View>
        </>
    )
}

export default Quicklinks