import "./global.css";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "./components/Header";
import { useAuthStore } from "./store/authStore";

export default function RootLayout() {

  const isLoggedin = useAuthStore((state) => state.isLoggedin)

  return (

    <SafeAreaView className="flex-1 bg-secondary">
      <CustomHeader />
      
      <Stack screenOptions={{ headerShown: false }}> 
        {isLoggedin ? (
          <>
            <Stack.Screen name="(tabs)" options={{ title: "College Buddy" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="(auth)" />
          </>
        )}
      </Stack>
    </SafeAreaView>

  );
}
