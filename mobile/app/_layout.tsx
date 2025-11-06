import "./global.css";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "./components/Header";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import PopUpProfile from "./components/POP-upProfile";

export default function RootLayout() {

  const checkAccessToken = useAuthStore((state) => state.checkAccessToken);
  const isProfileComplete = useAuthStore((state) => state.isProfileComplete);
  const isLoggedin = useAuthStore((state) => state.isLoggedin);

  useEffect(() => {
    checkAccessToken();
  }, [checkAccessToken]);

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <CustomHeader />
      {!isProfileComplete && isLoggedin && <PopUpProfile />}
      <Slot />
    </SafeAreaView>
  );
}
