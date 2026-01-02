import {View, Text, TouchableOpacity, ScrollView} from "react-native";
import React from "react";

const AddStudents = () => {

    const [ open, setOpen ] = React.useState(false);


    return (
        <View className="bg-secondary p-5 rounded-2xl border border-white/10">
            <TouchableOpacity onPress={() => setOpen((p) => !p)}>
                <Text className="text-white text-lg font-semibold">
                    Get Division
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                    Filter by semester & department
                </Text>
            </TouchableOpacity>

            {
                open && (
                    <ScrollView>

                    </ScrollView>
                )
            }

        </View>
    )

}

export default AddStudents;