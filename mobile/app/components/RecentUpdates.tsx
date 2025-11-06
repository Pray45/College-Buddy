import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { usePathname, useRouter } from 'expo-router';
import useNotificationStore from '../store/notificationStore';

const RecentUpdates = () => {


    const updates = useNotificationStore((state) => state.notifications);
    const router = useRouter();
    const currentPath = usePathname();

    const redirect = ({ update }: { update: string }) => {
        const updateroute = update.trim().replace(/\s+/g, '-').toLowerCase();
        
        router.push({
            pathname: "/(tabs)/notification/[notification]",
            params: { notification: updateroute, from: currentPath }, 
        });
    };



    return (
        <>
            <View className="my-6 mx-5 rounded-xl justify-center items-center bg-secondary border-[0.2px] border-textPrimary">
                {
                    updates && updates.length > 0 ? (
                        (() => {
                            const visible = updates.slice(0, 4);
                            return visible.map((update, index) => (
                                <View key={index} className="w-full">
                                    <TouchableOpacity onPress={() => redirect({ update: update.title })} className="mt-3 px-5 py-3 mb-1">
                                        <Text className="text-textPrimary text-2xl font-semibold">{update.title}</Text>
                                        <Text className="mt-2 text-textSecondary text-sm">{update.description}</Text>
                                    </TouchableOpacity>
                                    {index < visible.length - 1 && (
                                        <View className="mx-5 border-b border-[#29313C]" />
                                    )}
                                </View>
                            ));
                        })()
                    ) : (
                        <Text className="mt-2 text-textSecondary text-center  text-xl">No new updates</Text>
                    )
                }
            </View>
        </>
    )
}

export default RecentUpdates