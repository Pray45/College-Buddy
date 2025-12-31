import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from "../../src/store/authStore";
import { useRouter } from "expo-router";


export default function CustomHeader() {

    const router = useRouter();
    const login = useAuthStore((state) => state.loggedIn);
    const user = useAuthStore((state) => state.userData);

    return (
        <>
            <View className="flex-row justify-between h-16 px-7 my-2 bg-secondary items-center">

                <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="flex-row gap-3">
                    <Ionicons name="school" size={24} color="white" />
                    <Text className="text-white text-xl font-bold">College Buddy</Text>
                </TouchableOpacity>

                {
                    login && (

                        user?.role !== "STUDENT" ? (
                            <TouchableOpacity onPress={() => router.replace("/(admin)")} className="p-2.5 rounded-full bg-accent justify-center items-center">
                                <Text className="text-white text-lg font-bold">Dashboard</Text>
                            </TouchableOpacity>
                        ) : (

                            <TouchableOpacity onPress={() => router.push("../screens/profile")} className="w-12 h-12 rounded-full bg-accent justify-center items-center">
                                <Ionicons name="person" size={24} color="white" />
                            </TouchableOpacity>

                        )
                    )
                }

            </View >

        </>
    );
}
