import React from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'

const _layout = () => {
    return (
        <View className='bg-primary h-full w-full'>
            <Stack screenOptions={{ headerShown: false }} />
        </View>
    )
}

export default _layout