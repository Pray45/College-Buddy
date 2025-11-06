import { View, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router';
import RecentUpdates from '@/app/components/RecentUpdates';

const Index = () => {

    const router = useRouter();

    useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            router.push('/')    
            return true;
        });
        return () => handler.remove();
    },[]);

    return (
        <View className='bg-primary w-full h-full'>

            <RecentUpdates />

        </View>
    )
}

export default Index