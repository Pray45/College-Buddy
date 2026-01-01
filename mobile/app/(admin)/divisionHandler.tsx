import { Text, View } from "react-native";
import React from "react";
import CreateDivision from "../components/CreateDivision";
import GetDivision from "@/app/components/getDivision";

const DivisionHandler = () => {
    return (
        <View className="bg-primary flex-1 px-5 py-6">
            <Text className="text-white text-2xl font-bold mb-6">
                Division Management
            </Text>

            <View className="gap-2">

                <CreateDivision/>

                <GetDivision/>

            </View>

        </View>
    );
};

export default DivisionHandler;
