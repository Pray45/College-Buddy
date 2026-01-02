import { Text, View } from "react-native";
import React from "react";
import CreateDivision from "../components/CreateDivision";
import GetDivision from "@/app/components/getDivision";
import { useAuthStore } from "@/src/store/authStore";
import AddStudents from "@/app/components/AddStudents";

const DivisionHandler = () => {

    const userData = useAuthStore((s) => s.userData);

    return (
        <View className="bg-primary flex-1 px-5 py-6">
            <Text className="text-white text-2xl font-bold mb-6">
                Division Management
            </Text>

            {

                userData?.role === "HOD" ?
                (
                    <View className="gap-2">
                    
                        <CreateDivision/>
                        <GetDivision/>
                        <AddStudents/>
                    
                    </View>
                ) : (
                    <View className="gap-2">
                    
                        <GetDivision/>
                    
                    </View>
                )
            }

        </View>
    );
};

export default DivisionHandler;
