import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { useAuthStore } from '@/src/store/authStore';
import {useRequestStore} from "@/src/store/requestStore";

const RequestHandle = () => {
    const getRequests = useRequestStore((state) => state.getRequests);
    const requests = useRequestStore((state) => state.requests);
    const loading = useRequestStore((state) => state.loading);
    const error = useRequestStore((state) => state.error);
    const actionRequests = useRequestStore((state) => state.actionRequests);
    const userData = useAuthStore((state) => state.userData);

    const fetchRequests = async () => {
        try {
            await getRequests();
        } catch (error: any) {
            console.error("Failed to fetch requests:", error?.response?.status, error?.response?.data?.message);
        }
    };

    const handleAction = async (requestId: string, actionType: "APPROVE" | "REJECT") => {
        try {
            await actionRequests({
                approverId: userData?.id?.toString()!,
                requestId,
                reason: actionType,
                action: actionType,
            });

            fetchRequests();
        } catch (err) {
            console.error("Action failed", err);
        }
    };


    const isAuthorized = userData?.role === 'HOD' || userData?.role === 'PROFESSOR';

    if (!isAuthorized) {
        return (
            <ScrollView className='bg-primary h-full w-full'>
                <View className='px-6 pt-10 flex-1 justify-center items-center'>
                    <Text className='text-white text-2xl font-bold mb-4'>Access Denied</Text>
                    <Text className='text-textSecondary text-center'>
                        Only HOD and PROFESSOR can access pending requests.
                    </Text>
                    <Text className='text-accent text-sm mt-4'>
                        Your role: {userData?.role || 'Unknown'}
                    </Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView className='bg-primary h-full w-full'>
            <View className='px-6 pt-10 mb-40'>
                <View className='flex-row justify-between items-center mb-2'>
                    <Text className='text-white text-2xl font-bold mb-6'>Pending Requests</Text>
                    <TouchableOpacity
                        onPress={fetchRequests}
                        disabled={loading}
                    >
                        <Text className='text-textPrimary font-bold mb-6'>Refresh Requests</Text>
                    </TouchableOpacity>
                </View>

                {error && (
                    <View className='bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4'>
                        <Text className='text-red-300 text-sm'>{error}</Text>
                    </View>
                )}

                {loading && (
                    <View className='flex-1 justify-center items-center py-10'>
                        <ActivityIndicator size="large" color="#00FF88" />
                    </View>
                )}

                {!loading && (!requests || requests.length === 0) && !error && (
                    <Text className='text-textSecondary text-center py-10'>
                        No pending requests
                    </Text>
                )}

                {!loading && requests && requests.length > 0 && (
                    <View>
                        {requests.map((request: any, index: number) => (
                            <View key={request.id || index} className='bg-secondary rounded-xl p-4 mb-4'>
                                <Text className='text-textPrimary font-bold text-lg mb-2'>
                                    From : {request.User_VerificationRequest_userIdToUser?.name || 'Unknown User'}
                                </Text>
                                <Text className='text-textSecondary mb-2'>
                                    Status: <Text className='text-white font-semibold'>{request.status}</Text>
                                </Text>
                                <Text className='text-textSecondary mb-2'>
                                    Type: <Text className='text-white'>{request.type}</Text>
                                </Text>
                                <Text className='text-textSecondary mb-3'>
                                    Reason: <Text className='text-white'>{request.reason || 'N/A'}</Text>
                                </Text>
                                <View className='flex-row justify-around mt-3 rounded-lg bg-accent/20 p-2'>
                                    <TouchableOpacity className='px-4 py-2 rounded-lg' onPress={()=> handleAction(request.id, "APPROVE")}>
                                        <Text className='text-white font-bold'>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className='px-4 py-2 rounded-lg' onPress={()=> handleAction(request.id, "REJECT")}>
                                        <Text className='text-white font-bold'>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView >
    )
}

export default RequestHandle