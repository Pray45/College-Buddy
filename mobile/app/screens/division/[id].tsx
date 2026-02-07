import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDivisionStore } from "@/src/store/divisionStore";
import { useAuthStore } from "@/src/store/authStore";

const DEPARTMENT_MAP: Record<string, string> = {
    "1": "CSE",
    "2": "ECE",
    "3": "ME",
    "4": "EE",
    "5": "CIVIL",
};

const DivisionDetails = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { divisions, loading, getDivisions, removeStudentFromDivision, deleteDivision } = useDivisionStore();
    const userData = useAuthStore((s) => s.userData);
    const [deletingStudent, setDeletingStudent] = useState<string | null>(null);

    useEffect(() => {
        if (!divisions && !loading && id) {
            getDivisions();
        }
    }, [divisions, loading, id, getDivisions]);

    const division = useMemo(
        () => divisions?.find((d) => d.id === id),
        [divisions, id]
    );

    const students = division?.Student ?? [];
    const departmentName = division ? DEPARTMENT_MAP[division.departmentId] ?? division.departmentId : "";

    if (!id) {
        return (
            <View className="flex-1 bg-primary px-5 py-6">
                <Text className="text-white text-lg">Missing division id.</Text>
            </View>
        );
    }

    if (loading && !division) {
        return (
            <View className="flex-1 bg-primary px-5 py-6 justify-center items-center">
                <ActivityIndicator color="#00FF88" size="large" />
                <Text className="text-gray-400 mt-4">Loading division...</Text>
            </View>
        );
    }

    if (!division) {
        return (
            <View className="flex-1 bg-primary px-5 py-6 gap-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-secondary items-center justify-center border border-white/10"
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold">Division not found</Text>
                <Text className="text-gray-400">Try refreshing divisions and open again.</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-primary px-5 py-6" showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ title: `Division ${division.name}`, headerShown: false }} />

            <TouchableOpacity
                onPress={() => router.replace("/(admin)/divisionHandler")}
                className="mb-5 w-11 h-11 rounded-full bg-secondary items-center justify-center border border-white/10"
            >
                <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <View className="bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 rounded-3xl border border-white/10 shadow-md shadow-black/40 mb-4">
                <Text className="text-white text-3xl font-extrabold mb-2">Division {division.name}</Text>
                
                <View className="mt-6 flex-row gap-3 flex-wrap">
                    <View className="bg-textPrimary px-4 py-2 rounded-full border border-accent/40">
                        <Text className="text-accent text-sm font-semibold">{students.length} Students</Text>
                    </View>
                    <View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <Text className="text-gray-200 text-sm font-semibold">Dept: {departmentName || division.departmentId}</Text>
                    </View>
                    <View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <Text className="text-gray-200 text-sm font-semibold">Semester {division.semesterId}</Text>
                    </View>
                </View>
            </View>

            {userData?.role === "HOD" && (
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            "Delete Division",
                            `Are you sure you want to delete Division ${division.name}? This will unassign all students.`,
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            await deleteDivision(id!);
                                            Alert.alert("Success", "Division deleted successfully");
                                            router.replace("/(admin)/divisionHandler");
                                        } catch (error) {
                                            Alert.alert("Error", "Failed to delete division");
                                        }
                                    },
                                },
                            ]
                        );
                    }}
                    className="bg-red-500/10 p-4 rounded-2xl border border-red-500/30 mb-4 flex-row items-center justify-between"
                >
                    <View>
                        <Text className="text-red-500 font-semibold text-base">Delete Division</Text>
                        <Text className="text-red-400/70 text-xs mt-1">This will unassign all students</Text>
                    </View>
                    <Ionicons name="trash" size={24} color="#ef4444" />
                </TouchableOpacity>
            )}

            <View className="bg-secondary p-5 rounded-2xl border border-white/10 shadow-sm shadow-black/30">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white text-lg font-semibold">Students</Text>
                    <View className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <Text className="text-gray-200 text-xs">List updates live</Text>
                    </View>
                </View>

                {students.length === 0 && (
                    <Text className="text-gray-400">No students assigned to this division yet.</Text>
                )}

                {students.map((student) => (
                    <View
                        key={student.id}
                        className="mb-3 p-4 rounded-xl bg-black/25 border border-white/5 flex-row items-center justify-between"
                    >
                        <View className="flex-1">
                            <Text className="text-white font-semibold">{student.User?.name ?? "Unnamed"}</Text>
                            <Text className="text-gray-400 text-sm">{student.User?.email ?? "No email"}</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <View className="bg-accent/20 px-3 py-1 rounded-full border border-accent/40">
                                <Text className="text-accent text-xs font-semibold">ID {student.id.slice(0, 6)}</Text>
                            </View>
                            {userData?.role === "HOD" && (
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            "Remove Student",
                                            `Remove ${student.User?.name} from this division?`,
                                            [
                                                { text: "Cancel", style: "cancel" },
                                                {
                                                    text: "Remove",
                                                    style: "destructive",
                                                    onPress: async () => {
                                                        setDeletingStudent(student.id);
                                                        try {
                                                            await removeStudentFromDivision({
                                                                divisionId: id!,
                                                                studentIds: [student.id],
                                                            });
                                                            Alert.alert("Success", "Student removed successfully");
                                                        } catch (error) {
                                                            Alert.alert("Error", "Failed to remove student");
                                                        } finally {
                                                            setDeletingStudent(null);
                                                        }
                                                    },
                                                },
                                            ]
                                        );
                                    }}
                                    disabled={deletingStudent === student.id}
                                    className="bg-red-500/20 p-2 rounded-lg border border-red-500/40"
                                >
                                    {deletingStudent === student.id ? (
                                        <ActivityIndicator size="small" color="#ef4444" />
                                    ) : (
                                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default DivisionDetails;
