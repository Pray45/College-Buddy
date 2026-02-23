import { Text, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubjectStore } from "@/src/store/subjectStore";
import colors from "@/src/config/colors";

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const DEPARTMENTS = [
    { id: "1", label: "CSE" },
    { id: "2", label: "ECE" },
    { id: "3", label: "ME" },
    { id: "4", label: "EE" },
    { id: "5", label: "CIVIL" },
];

const GetSubject = () => {
    const [open, setOpen] = useState(false);
    const [semester, setSemester] = useState<string | null>(null);
    const [department, setDepartment] = useState<string | null>(null);

    const { subjects, loading, getAllSubjects } = useSubjectStore();
    const router = useRouter();

    useEffect(() => {
        if (open) {
            getAllSubjects();
        }
    }, [open]);

    const filteredSubjects = useMemo(() => {
        if (!subjects) return [];

        return subjects.filter((s) => {
            if (semester && s.semesterId !== semester) return false;
            return !(department && s.departmentId !== department);
        });
    }, [subjects, semester, department]);

    return (
        <View className="bg-secondary p-5 rounded-2xl border border-white/10">
            <TouchableOpacity onPress={() => setOpen((p) => !p)}>
                <Text className="text-white text-lg font-semibold">
                    Get Subject
                </Text>
                <Text className="text-textMuted text-sm mt-1">
                    Filter by semester & department
                </Text>
            </TouchableOpacity>

            {open && (
                <View className="mt-5 space-y-4">

                    {/* DEPARTMENTS */}
                    <View className="flex-row gap-5 flex-wrap mb-5">
                        {DEPARTMENTS.map((d) => (
                            <TouchableOpacity
                                key={d.id}
                                onPress={() =>
                                    setDepartment((p) =>
                                        p === d.id ? null : d.id
                                    )
                                }
                                disabled={loading}
                                className={`px-4 py-2 rounded-full border ${
                                    department === d.id
                                        ? "bg-textPrimary border-accent"
                                        : "border-white/10"
                                }`}
                            >
                                <Text
                                    className={`text-sm ${
                                        department === d.id
                                            ? "text-accent"
                                            : "text-textMuted"
                                    }`}
                                >
                                    {d.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* SEMESTERS */}
                    <View className="flex-row gap-3 flex-wrap mb-4">
                        {SEMESTERS.map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() =>
                                    setSemester((p) => (p === s ? null : s))
                                }
                                disabled={loading}
                                className={`px-4 py-1 rounded-full border ${
                                    semester === s
                                        ? "bg-textPrimary border-accent"
                                        : "border-white/10"
                                }`}
                            >
                                <Text
                                    className={`text-sm ${
                                        semester === s
                                            ? "text-accent"
                                            : "text-textMuted"
                                    }`}
                                >
                                    Sem {s}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading && (
                        <Text className="text-textMuted text-sm">
                            Fetching subjects...
                        </Text>
                    )}

                    {!loading &&
                        filteredSubjects.map((subject) => (
                            <TouchableOpacity
                                key={subject.id}
                                onPress={() => router.push(`/screens/subject/${subject.id}`)}
                                activeOpacity={0.7}
                                className="mt-2 bg-black/30 p-4 rounded-xl border border-white/5"
                            >
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold">
                                            {subject.name}
                                        </Text>
                                        <Text className="text-textMuted text-xs mt-1">
                                            Code: {subject.code}
                                        </Text>
                                        {subject.description && (
                                            <Text className="text-textDim text-xs mt-2">
                                                {subject.description}
                                            </Text>
                                        )}
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-accent/20 px-3 py-1 rounded-full">
                                            <Text className="text-accent text-xs font-semibold">
                                                Sem {subject.semesterId}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                    {!loading && filteredSubjects.length === 0 && (semester || department) && (
                        <Text className="text-textMuted text-sm text-center py-4">
                            No subjects found for the selected filters
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

export default GetSubject;
