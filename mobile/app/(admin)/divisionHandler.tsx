import { Text, View } from "react-native";
import React from "react";
import CreateDivision from "../components/CreateDivision";

const DivisionHandler = () => {
    return (
        <View className="bg-primary flex-1 px-5 py-6">
            <Text className="text-white text-2xl font-bold mb-6">
                Division Management
            </Text>

            <CreateDivision/>

        </View>
    );
};

export default DivisionHandler;
