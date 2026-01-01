import { Text, View, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import {useDivisionStore} from "@/src/store/divisionStore";
import Toast from "react-native-toast-message"

const DEPARTMENTS = [
    { label: "Computer Science & Engineering", value: 1 },
    { label: "Electronics & Communication Engineering", value: 2 },
    { label: "Mechanical Engineering", value: 3 },
    { label: "Electrical Engineering", value: 4 },
    { label: "Civil Engineering", value: 5 },
] as const;

const SEMESTERS = [
    { label: "Semester 1", value: 1 },
    { label: "Semester 2", value: 2 },
    { label: "Semester 3", value: 3 },
    { label: "Semester 4", value: 4 },
    { label: "Semester 5", value: 5 },
    { label: "Semester 6", value: 6 },
    { label: "Semester 7", value: 7 },
    { label: "Semester 8", value: 8 },
] as const;

const CreateDivision = () => {

    const [createDiv, setCreateDiv] = useState(false);
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [semester, setSemester] = useState("");

    const createDivisioin = useDivisionStore((s) => s.createDivision);


    const handleCreateDivision = async() => {

        try {

            if (!name || !semester) {
                console.error("Missing fields");
                return;
            }

            const res = await createDivisioin({ name, department, semester });

            Toast.show({
                type: "success",
                text1: "Division created",
                text2: `Division ${name} created successfully`,
            });

            setName("");
            setDepartment("");
            setSemester("");

        } catch (error:any) {
            console.error(error)
            Toast.show({
                type: "error",
                text1: "Creation failed",
                text2: error?.message || "Something went wrong",
            });
        }

    };

    return(

        <View className="bg-secondary p-5 rounded-2xl border border-white/10">

            {/* HEADER (clickable) */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCreateDiv((prev) => !prev)}
            >
                <Text className="text-white text-lg font-semibold">
                    Create Division
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                    Add a new division for students
                </Text>
            </TouchableOpacity>

            {/* FORM (NOT clickable) */}
            {createDiv && (
                <View className="mt-5">
                    <Text className="text-white text-sm font-semibold mb-2">
                        Division Name
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Division Name"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="characters"
                        className="bg-zinc-800 px-4 h-12 rounded-md mb-4 text-white"
                    />

                    <Text className="text-white text-sm font-semibold mb-2">
                        Department
                    </Text>
                    <View className="bg-zinc-800 rounded-md mb-4 overflow-hidden">
                        <Picker
                            selectedValue={department}
                            onValueChange={(value) => setDepartment(value)}
                        >
                            <Picker.Item label="Select Department" value={null} color="#9ca3af"    />
                            {DEPARTMENTS.map((dept) => (
                                <Picker.Item
                                    key={dept.value}
                                    label={dept.label}
                                    value={dept.value}
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text className="text-white text-sm font-semibold mb-2">
                        Semester
                    </Text>
                    <View className="bg-zinc-800 rounded-md mb-4 overflow-hidden">
                        <Picker
                            selectedValue={semester}
                            onValueChange={(value) => setSemester(value)}
                        >
                            <Picker.Item label="Select Semester" value={null} color="#9ca3af"    />
                            {SEMESTERS.map((sem) => (
                                <Picker.Item
                                    key={sem.value}
                                    label={sem.label}
                                    value={sem.value}
                                />
                            ))}
                        </Picker>
                    </View>

                    <TouchableOpacity
                        className="bg-textPrimary py-3 rounded-xl"
                        onPress={handleCreateDivision}
                    >
                        <Text className="text-black font-bold text-center">
                            Create Division
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>

    )

}
export default CreateDivision;