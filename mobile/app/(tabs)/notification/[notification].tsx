import { View, Text, BackHandler } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'

const Notification = () => {

    const router = useRouter();
    const { from, notification } = useLocalSearchParams<{ from?: string; notification?: string }>();

    const displayTitle = (notification ?? '').split(' ')
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ');


    const goBack = useCallback(() => {
        if (from) {
            router.replace(from as Href);
        }
        else router.back();
    }, [from, router]);

    useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            goBack();
            return true;
        });
        return () => handler.remove();
    }, [goBack]);

    return (
        <View className="flex-1 bg-primary px-5 py-6">
            <Text className="text-textPrimary text-2xl font-semibold">
                {displayTitle || 'Notification'}
            </Text>
        </View>
    );
}

export default Notification