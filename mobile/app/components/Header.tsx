import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from "../../src/store/authStore";
import { useSideNavStore } from "../../src/store/sideNavStore";
import { useRouter } from "expo-router";
import colors from "../../src/config/colors";


export default function CustomHeader() {

    const router = useRouter();
    const login = useAuthStore((state) => state.loggedIn);
    const user = useAuthStore((state) => state.userData);
    const toggleSideNav = useSideNavStore((state) => state.toggleSideNav);

    return (
        <>
            <View className="flex-row justify-between h-16 px-7 my-2 bg-secondary items-center">

                <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="flex-row gap-3">
                    <Ionicons name="school" size={24} color={colors.textWhite} />
                    <Text className="text-white text-xl font-bold">College Buddy</Text>
                </TouchableOpacity>

                {
                    login && (
                        <TouchableOpacity onPress={toggleSideNav} className="p-2.5 rounded-full bg-accent justify-center items-center">
                            <Ionicons name="menu" size={24} color={colors.textWhite} />
                        </TouchableOpacity>
                    )
                }

            </View >

        </>
    );
}
