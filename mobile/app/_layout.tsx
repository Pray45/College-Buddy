import "./global.css";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "./components/Header";

export default function RootLayout() {

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <CustomHeader />
      <Slot />
    </SafeAreaView>
  );
}
