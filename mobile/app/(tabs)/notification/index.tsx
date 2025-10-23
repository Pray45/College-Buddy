import { View, Text } from 'react-native'
import React from 'react'
import RecentUpdates from '@/app/components/RecentUpdates'

const index = () => {

    const updates = [
        {
            title: "New Semester Begins",
            description: "Welcome back! The new semester starts on September 1st. Check your schedule and get ready for exciting courses!"
        },
        {
            title: "Campus Safety Measures",
            description: "Please remember to follow the updated campus safety guidelines to ensure a safe environment for everyone."
        },
        {
            title: "Library Renovation",
            description: "The campus library is undergoing renovations to provide better study spaces and resources. Stay tuned for updates!"
        },
    ];

    return (
        <View className='bg-primary w-full h-full'>

            <RecentUpdates updates={updates} />

        </View>
    )
}

export default index