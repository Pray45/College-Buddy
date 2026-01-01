import { Text, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import { useDivisionStore } from "@/src/store/divisionStore";

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const DEPARTMENTS = [
    { id: "1", label: "CSE" },
    { id: "2", label: "ECE" },
    { id: "3", label: "ME" },
    { id: "4", label: "EE" },
    { id: "5", label: "CIVIL" },
];

const GetDivision = () => {
    const [open, setOpen] = useState(false);
    const [semester, setSemester] = useState<string | null>(null);
    const [department, setDepartment] = useState<string | null>(null);

    const { divisions, loading, getDivisions } = useDivisionStore();

    useEffect(() => {
        if (open) {
            getDivisions();
        }
    }, [open]);

    const filteredDivisions = useMemo(() => {
        if (!divisions) return [];

        return divisions.filter((d) => {
            if (semester && d.semesterId !== semester) return false;
            return !(department && d.departmentId !== department);

        });
    }, [divisions, semester, department]);

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
                                            : "text-gray-400"
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
                                            : "text-gray-400"
                                    }`}
                                >
                                    Sem {s}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading && (
                        <Text className="text-gray-400 text-sm">
                            Fetching divisions...
                        </Text>
                    )}

                    {!loading &&
                        filteredDivisions.map((div) => (
                            <View
                                key={div.id}
                                className="mt-2 flex-row justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5"
                            >
                                <View>
                                    <Text className="text-white font-semibold">
                                        Division {div.name}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        Semester {div.semesterId} · Dept{" "}
                                        {div.departmentId}
                                    </Text>
                                </View>

                                <View className="bg-accent/20 px-3 py-1 rounded-full">
                                    <Text className="text-accent text-xs font-semibold">
                                        {div.Student?.length ?? 0} Students
                                    </Text>
                                </View>
                            </View>
                        ))}
                </View>
            )}
        </View>
    );
};

export default GetDivision;
