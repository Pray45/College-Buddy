import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/build/Ionicons'

const UpcomingEvents = ({events} : {events: Array<{title: string, day: string, month: string, location: string}>}) => {
    return (
        <>
            <View className="mx-5 mt-10 flex-row justify-between px-5">
                <View className="flex-row items-center gap-3">
                    <Ionicons name="calendar-outline" size={24} color="white" />
                    <Text className="text-textTheme text-2xl font-semibold">
                        Upcoming Events
                    </Text>
                </View>
                {events && events.length > 3 && (
                    <TouchableOpacity>
                        <Text className="mt-2 text-textPrimary text-sm">View All</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="mx-7 bg-secondary border-[0.2px] border-textPrimary rounded-xl mt-5 mb-10">
                {
                    events && events.length > 0 ? events.slice(0, 3).map((event, index) => (
                        <View key={index} className="w-full">
                            <TouchableOpacity className="flex-row items-center p-5 gap-5">

                                <View className="bg-accent/20 rounded-2xl w-20 h-20 justify-center items-center">
                                    <Text className="text-textPrimary  text-3xl font-bold">{event.day}</Text>
                                    <Text className="text-textPrimary  text-sm font-semibold">{event.month}</Text>
                                </View>


                                <View className="flex-1">
                                    <Text className="text-textTheme text-xl font-semibold">{event.title}</Text>
                                    <Text className="mt-1 text-textSecondary text-sm">{event.location}</Text>
                                </View>
                            </TouchableOpacity>


                            {index < events.slice(0, 3).length - 1 && (
                                <View className="mx-5 border-b border-[#29313C]" />
                            )}
                        </View>
                    )) : (
                        <Text className="text-textTheme py-5 text-xl font-semibold text-center">
                            No upcoming events at the moment.
                        </Text>
                    )
                }
            </View>
        </>
    )
}

export default UpcomingEvents