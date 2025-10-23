import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";
import CustomHeader from "./components/CustomHeader";

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1 bg-secondary">
      
      <CustomHeader />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ title: "College Buddy" }} />
      </Stack>

    </SafeAreaView>
  );
}
