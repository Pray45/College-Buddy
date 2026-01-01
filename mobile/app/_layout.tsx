import "./global.css";
import { Redirect, Slot, useSegments } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "./components/Header";
import { useEffect, useState } from "react";
import { useAuthStore } from "../src/store/authStore";
import { initAuthInterceptors } from "../src/config/authInterceptor";
import Toast from "react-native-toast-message";


export default function RootLayout() {

  const checkAccessToken = useAuthStore((state) => state.checkAccessToken);
  const startTokenRefreshCycle = useAuthStore((state) => state.startTokenRefreshCycle);
  const stopTokenRefreshCycle = useAuthStore((state) => state.stopTokenRefreshCycle);
  const loggedIn = useAuthStore((state) => state.loggedIn);
  const loading = useAuthStore((state) => state.loading);
  const [isChecking, setIsChecking] = useState(true);
  const segments = useSegments();
  const inAuth = segments?.[0] === "(auth)";

  useEffect(() => {
    initAuthInterceptors();
    const checkAuth = async () => {
      await checkAccessToken();
      setIsChecking(false);
    };
    checkAuth();
  }, [checkAccessToken]);

  // Start token refresh cycle when user is logged in
  useEffect(() => {
    if (loggedIn && !isChecking) {
      startTokenRefreshCycle();
    } else {
      stopTokenRefreshCycle();
    }

    return () => {
      stopTokenRefreshCycle();
    };
  }, [loggedIn, isChecking, startTokenRefreshCycle, stopTokenRefreshCycle]);


  if (!loggedIn && !inAuth && !isChecking) {
    return <Redirect href="/(auth)/log-in" />;
  }

  if (!inAuth && (isChecking || loading)) return null;

  if (!loggedIn && !inAuth) return <Redirect href="/(auth)/log-in" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      {!inAuth && <CustomHeader />}
      <Slot />
      <Toast/>
    </SafeAreaView>
  );
}
