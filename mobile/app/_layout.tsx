import "./global.css";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "./components/Header";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";

export default function RootLayout() {

  const checkAccessToken = useAuthStore((state) => state.checkAccessToken);


  useEffect(() => {
    checkAccessToken();
  }, [checkAccessToken]);

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <CustomHeader />
      <Slot />
    </SafeAreaView>
  );
}
