import { Text, View } from "react-native";
import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import CreateSubject from "../components/CreateSubject";

const SubjectHandler = () => {
  
    const userData = useAuthStore((s) => s.userData)

    return (
      <View className="bg-primary flex-1 px-5 py-6">
        <Text className="text-white text-2xl font-bold mb-6">
          Subject Management
        </Text>

        {userData?.role === "HOD" ? (
          <View className="gap-2">
            <CreateSubject />
          </View>
        ) : (
          <View className="gap-2">
          
          </View>
        )}
      </View>
    );
  }

export default SubjectHandler;