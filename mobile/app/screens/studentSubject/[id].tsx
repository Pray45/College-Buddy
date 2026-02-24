import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/src/config/axios";
import { extractErrorMessage } from "@/src/utils/extractErrorMessage";
import colors from "@/src/config/colors";

/* ── types ──────────────────────────────────────── */
type StudentEntry = {
  id: string;
  status: string;
  enrolledAt: string;
  Student?: {
    id: string;
    enrollmentNo: string;
    divisionId?: string | null;
    User?: { id: string; name: string; email: string } | null;
    Division?: { id: string; name: string } | null;
  } | null;
};

type DivAssignment = {
  id: string;
  divisionId: string;
  Division?: { id: string; name: string } | null;
  Professor?: {
    id: string;
    teacherId?: string;
    User?: { id: string; name: string; email: string } | null;
  } | null;
};

type SubjectDetail = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  department?: { id: string; name: string } | null;
  semester?: { id: string; number: number } | null;
  DivisionSubjectAssignment?: DivAssignment[];
  StudentSubject?: StudentEntry[];
};

/* ── component ──────────────────────────────────── */
const StudentSubjectDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDiv, setExpandedDiv] = useState<string | null>(null);

  const fetchDetails = async (isRefresh = false) => {
    if (!id) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/subject/details/${id}`);
      setSubject(res.data?.data?.subject ?? null);
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  /* ── loading ─────────────────────────────── */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.primary }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.accentBright} />
        <Text className="mt-3 text-sm" style={{ color: colors.textMuted }}>
          Loading details…
        </Text>
      </View>
    );
  }

  /* ── error ───────────────────────────────── */
  if (error || !subject) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: colors.primary }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text className="mt-3 text-center text-base" style={{ color: colors.dangerText }}>
          {error ?? "Subject not found"}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-5 px-6 py-2.5 rounded-xl" style={{ backgroundColor: colors.accent }}>
          <Text style={{ color: colors.accentBright }} className="font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const assignments = subject.DivisionSubjectAssignment ?? [];
  const students = subject.StudentSubject ?? [];

  /* ── render ──────────────────────────────── */
  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.primary }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchDetails(true)} tintColor={colors.accentBright} colors={[colors.accentBright]} />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ─────────────────────────── */}
      <View className="px-5 pt-14 pb-5" style={{ backgroundColor: colors.secondary }}>
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 mb-4">
          <Ionicons name="arrow-back" size={22} color={colors.accentBright} />
          <Text className="text-sm font-medium" style={{ color: colors.accentBright }}>Back</Text>
        </TouchableOpacity>

        {/* code badge */}
        <View className="self-start px-3 py-1 rounded-lg mb-2" style={{ backgroundColor: colors.accent }}>
          <Text className="text-xs font-bold" style={{ color: colors.accentBright }}>{subject.code}</Text>
        </View>

        <Text className="text-2xl font-bold mb-1" style={{ color: colors.textWhite }}>{subject.name}</Text>

        {subject.description ? (
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{subject.description}</Text>
        ) : null}

        {/* meta pills */}
        <View className="flex-row flex-wrap gap-3 mt-3">
          {subject.department && (
            <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.overlayLight }}>
              <Ionicons name="business-outline" size={13} color={colors.textMuted} />
              <Text className="text-xs" style={{ color: colors.textMuted }}>{subject.department.name}</Text>
            </View>
          )}
          {subject.semester && (
            <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.overlayLight }}>
              <Ionicons name="layers-outline" size={13} color={colors.textMuted} />
              <Text className="text-xs" style={{ color: colors.textMuted }}>Semester {subject.semester.number}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Divisions & Professors ─────────── */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="git-branch-outline" size={18} color={colors.accentBright} />
          <Text className="text-lg font-bold" style={{ color: colors.textWhite }}>
            Divisions & Professors
          </Text>
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.overlayLight }}>
            <Text className="text-xs" style={{ color: colors.textLight }}>{assignments.length}</Text>
          </View>
        </View>

        {assignments.length === 0 ? (
          <View className="rounded-xl p-4 items-center" style={{ backgroundColor: colors.secondary }}>
            <Text style={{ color: colors.textDim }}>No divisions assigned yet</Text>
          </View>
        ) : (
          assignments.map((assignment) => {
            const isExpanded = expandedDiv === assignment.id;
            const divStudents = students.filter(
              (s) => s.Student?.divisionId === assignment.divisionId
            );

            return (
              <View key={assignment.id} className="rounded-xl mb-2 overflow-hidden" style={{ backgroundColor: colors.secondary }}>
                <TouchableOpacity
                  onPress={() => setExpandedDiv(isExpanded ? null : assignment.id)}
                  className="flex-row items-center p-4"
                  activeOpacity={0.7}
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-base" style={{ color: colors.textWhite }}>
                      Division {assignment.Division?.name ?? "—"}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      <Text className="text-xs" style={{ color: colors.textMuted }}>
                        {assignment.Professor?.User?.name ?? "No teacher"}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textDim }}>
                        • {divStudents.length} students
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={isExpanded ? colors.accentBright : colors.textMuted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View className="px-4 pb-4">
                    {/* professor card */}
                    <View className="p-3 rounded-lg mb-3" style={{ backgroundColor: colors.overlayLight, borderWidth: 1, borderColor: colors.borderFaint }}>
                      <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
                        Professor
                      </Text>
                      {assignment.Professor?.User ? (
                        <View>
                          <Text className="font-semibold" style={{ color: colors.textWhite }}>{assignment.Professor.User.name}</Text>
                          <Text className="text-sm" style={{ color: colors.textMuted }}>{assignment.Professor.User.email}</Text>
                        </View>
                      ) : (
                        <Text className="text-sm" style={{ color: colors.textDim }}>No professor assigned</Text>
                      )}
                    </View>

                    {/* students list */}
                    <View className="p-3 rounded-lg" style={{ backgroundColor: colors.overlayLight, borderWidth: 1, borderColor: colors.borderFaint }}>
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                          Students
                        </Text>
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.overlayLight, borderWidth: 1, borderColor: colors.borderLight }}>
                          <Text className="text-xs" style={{ color: colors.textLight }}>{divStudents.length}</Text>
                        </View>
                      </View>

                      {divStudents.length === 0 ? (
                        <Text className="text-sm" style={{ color: colors.textDim }}>No students enrolled from this division.</Text>
                      ) : (
                        divStudents.map((entry) => (
                          <View key={entry.id} className="mb-2 p-3 rounded-lg" style={{ backgroundColor: colors.overlayDark, borderWidth: 1, borderColor: colors.borderFaint }}>
                            <View className="flex-row items-center justify-between">
                              <View className="flex-1">
                                <Text className="font-semibold text-sm" style={{ color: colors.textWhite }}>
                                  {entry.Student?.User?.name ?? "Unnamed"}
                                </Text>
                                <Text className="text-xs" style={{ color: colors.textMuted }}>
                                  {entry.Student?.User?.email ?? ""}
                                </Text>
                              </View>
                              <View className="flex-row gap-2">
                                {entry.Student?.enrollmentNo && (
                                  <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.overlayLight, borderWidth: 1, borderColor: colors.borderLight }}>
                                    <Text className="text-xs" style={{ color: colors.textLight }}>{entry.Student.enrollmentNo}</Text>
                                  </View>
                                )}
                                <View
                                  className="px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: entry.status === "ACTIVE" ? colors.successMuted : colors.overlayLight,
                                    borderWidth: 1,
                                    borderColor: entry.status === "ACTIVE" ? colors.accentBright + "40" : colors.borderLight,
                                  }}
                                >
                                  <Text
                                    className="text-xs font-semibold"
                                    style={{ color: entry.status === "ACTIVE" ? colors.accentBright : colors.textLight }}
                                  >
                                    {entry.status}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* ── All Enrolled Students ──────────── */}
      <View className="px-4 mt-5">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="people" size={18} color={colors.accentBright} />
          <Text className="text-lg font-bold" style={{ color: colors.textWhite }}>
            All Enrolled Students
          </Text>
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.overlayLight }}>
            <Text className="text-xs" style={{ color: colors.textLight }}>{students.length}</Text>
          </View>
        </View>

        {students.length === 0 ? (
          <View className="rounded-xl p-4 items-center" style={{ backgroundColor: colors.secondary }}>
            <Text style={{ color: colors.textDim }}>No students enrolled yet</Text>
          </View>
        ) : (
          students.map((entry) => (
            <View
              key={entry.id}
              className="rounded-xl p-3 mb-2 flex-row items-center"
              style={{ backgroundColor: colors.secondary }}
            >
              <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.accent }}>
                <Text className="font-bold text-sm" style={{ color: colors.accentBright }}>
                  {(entry.Student?.User?.name ?? "?")[0].toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-sm" style={{ color: colors.textWhite }}>
                  {entry.Student?.User?.name ?? "Unnamed"}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  {entry.Student?.enrollmentNo && (
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{entry.Student.enrollmentNo}</Text>
                  )}
                  {entry.Student?.Division?.name && (
                    <>
                      <Text className="text-xs" style={{ color: colors.textDim }}>•</Text>
                      <Text className="text-xs" style={{ color: colors.textMuted }}>Div {entry.Student.Division.name}</Text>
                    </>
                  )}
                </View>
              </View>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: entry.status === "ACTIVE" ? colors.successMuted : colors.overlayLight,
                  borderWidth: 1,
                  borderColor: entry.status === "ACTIVE" ? colors.accentBright + "40" : colors.borderLight,
                }}
              >
                <Text className="text-xs font-semibold" style={{ color: entry.status === "ACTIVE" ? colors.accentBright : colors.textLight }}>
                  {entry.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* bottom spacer */}
      <View className="h-8" />
    </ScrollView>
  );
};

export default StudentSubjectDetail;
