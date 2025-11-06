import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const PopUpProfile = () => {

    const route = useRouter();

    return (
        <View className="justify-center items-center">
            <View className='w-full h-10 bg-red-600 px-7 flex-row justify-between items-center'>
                <Text className='text-white text-xl'>Complete Your Profile</Text>
                <TouchableOpacity onPress={()=> route.push("../screens/profile")} className='w-32 h-8 bg-white justify-center items-center'><Text className='text-red-600'>Complete now</Text></TouchableOpacity>
            </View>
        </View>
    )
}

export default PopUpProfile