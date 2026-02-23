import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "@/src/config/axios";
import { useDivisionStore } from "@/src/store/divisionStore";
import { extractErrorMessage } from "@/src/utils/extractErrorMessage";
import colors from "@/src/config/colors";

type Professor = {
    id: string;
    userId: string;
    teacherId: string;
    User: { id: string; name: string; email: string };
};

interface Props {
    subjectId: string;
    departmentId: string;
    assignedDivisionIds: string[];
    onAssigned: () => void;
}

const AssignDivisionToSubject = ({
    subjectId,
    departmentId,
    assignedDivisionIds,
    onAssigned,
}: Props) => {
    const [open, setOpen] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
    const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loadingProfessors, setLoadingProfessors] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { divisions, loading: divLoading, getDivisions } = useDivisionStore();

    useEffect(() => {
        if (open && !divisions) {
            getDivisions();
        }
    }, [open, divisions, getDivisions]);

    useEffect(() => {
        if (open && departmentId) {
            fetchProfessors();
        }
    }, [open, departmentId]);

    const fetchProfessors = async () => {
        setLoadingProfessors(true);
        try {
            const res = await api.get("/div/professors", {
                params: { departmentId },
            });
            setProfessors(res.data?.data?.professors ?? []);
        } catch {
            setProfessors([]);
        } finally {
            setLoadingProfessors(false);
        }
    };

    const availableDivisions = (divisions ?? []).filter(
        (d) =>
            d.departmentId === departmentId &&
            !assignedDivisionIds.includes(d.id)
    );

    const handleAssign = async () => {
        if (!selectedDivision || !selectedProfessor) {
            Alert.alert("Missing Selection", "Please select both a division and a teacher.");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Assign teacher + subject to division
            await api.post("/assign-tchr/create", {
                divisionId: selectedDivision,
                professorId: selectedProfessor,
                subjectId,
            });

            // 2. Get students of that division
            const studentsRes = await api.get(`/div/students/${selectedDivision}`);
            const divStudents: { id: string }[] =
                studentsRes.data?.data?.students?.Student ?? [];

            // 3. Enroll all students to the subject
            if (divStudents.length > 0) {
                const studentIds = divStudents.map((s) => s.id);
                await api.post("/assign-stu/create", {
                    subjectId,
                    studentIds,
                });
            }

            Alert.alert(
                "Success",
                `Division assigned with teacher and ${divStudents.length} students enrolled.`
            );

            setSelectedDivision(null);
            setSelectedProfessor(null);
            setOpen(false);
            onAssigned();
        } catch (err : string | any) {
            Alert.alert("Error", extractErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="bg-secondary p-5 rounded-2xl border border-white/10 mb-4">
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setOpen((p) => !p)}
                className="flex-row items-center justify-between"
            >
                <View>
                    <Text className="text-white text-lg font-semibold">
                        Assign Division
                    </Text>
                    <Text className="text-textMuted text-sm mt-1">
                        Add a division with teacher & auto-enroll students
                    </Text>
                </View>
                <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.textMuted}
                />
            </TouchableOpacity>

            {open && (
                <View className="mt-5">
                    {/* Division Selection */}
                    <Text className="text-white text-sm font-semibold mb-2">
                        Select Division
                    </Text>

                    {divLoading ? (
                        <ActivityIndicator color={colors.accentBright} className="my-3" />
                    ) : availableDivisions.length === 0 ? (
                        <Text className="text-textDim text-sm mb-4">
                            No unassigned divisions available for this department.
                        </Text>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                        >
                            {availableDivisions.map((div) => (
                                <TouchableOpacity
                                    key={div.id}
                                    onPress={() => setSelectedDivision(div.id)}
                                    className={`mr-2 px-4 py-2 rounded-full border ${
                                        selectedDivision === div.id
                                            ? "bg-accent/30 border-accent"
                                            : "bg-white/5 border-white/10"
                                    }`}
                                >
                                    <Text
                                        className={
                                            selectedDivision === div.id
                                                ? "text-accent font-semibold"
                                                : "text-textMuted"
                                        }
                                    >
                                        {div.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Professor Selection */}
                    <Text className="text-white text-sm font-semibold mb-2">
                        Select Teacher
                    </Text>

                    {loadingProfessors ? (
                        <ActivityIndicator color={colors.accentBright} className="my-3" />
                    ) : professors.length === 0 ? (
                        <Text className="text-textDim text-sm mb-4">
                            No professors found for this department.
                        </Text>
                    ) : (
                        <View className="mb-4">
                            {professors.map((prof) => (
                                <TouchableOpacity
                                    key={prof.id}
                                    onPress={() =>
                                        setSelectedProfessor(prof.User.id)
                                    }
                                    className={`mb-2 p-3 rounded-xl border flex-row items-center justify-between ${
                                        selectedProfessor === prof.User.id
                                            ? "bg-accent/10 border-accent/40"
                                            : "bg-black/25 border-white/5"
                                    }`}
                                >
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-sm">
                                            {prof.User.name}
                                        </Text>
                                        <Text className="text-textMuted text-xs">
                                            {prof.User.email}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                            <Text className="text-textMuted text-xs">
                                                {prof.teacherId}
                                            </Text>
                                        </View>
                                        {selectedProfessor === prof.User.id && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={18}
                                                color={colors.accentBright}
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={handleAssign}
                        disabled={
                            submitting ||
                            !selectedDivision ||
                            !selectedProfessor
                        }
                        className={`p-4 rounded-xl flex-row items-center justify-center gap-2 ${
                            !selectedDivision || !selectedProfessor
                                ? "bg-white/5 border border-white/10"
                                : "bg-accent/20 border border-accent/40"
                        }`}
                    >
                        {submitting ? (
                            <ActivityIndicator color={colors.accentBright} />
                        ) : (
                            <>
                                <Ionicons
                                    name="checkmark-done"
                                    size={20}
                                    color={
                                        !selectedDivision ||
                                        !selectedProfessor
                                            ? colors.textDim
                                            : colors.accentBright
                                    }
                                />
                                <Text
                                    className={`font-semibold ${
                                        !selectedDivision ||
                                        !selectedProfessor
                                            ? "text-textDim"
                                            : "text-accent"
                                    }`}
                                >
                                    Assign & Enroll Students
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default AssignDivisionToSubject;
