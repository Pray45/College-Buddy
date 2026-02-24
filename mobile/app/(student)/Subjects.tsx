import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/src/config/axios";
import { useAuthStore } from "@/src/store/authStore";
import { extractErrorMessage } from "@/src/utils/extractErrorMessage";
import StudentSubjectCard, { type SubjectCardData } from "@/app/components/StudentSubjectCard";
import colors from "@/src/config/colors";

/* ── types ──────────────────────────────────────── */
type Enrollment = {
  id: string;
  status: string;
  enrolledAt: string;
  Subject: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    semester?: { number: number } | null;
    department?: { id?: string; name: string } | null;
    DivisionSubjectAssignment?: Array<{
      Division?: { id?: string; name: string } | null;
      Professor?: { User?: { name: string } | null } | null;
    }>;
  };
};

type AllSubject = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  department?: { id: string; name: string } | null;
  semester?: { id: string; number: number; departmentId?: string } | null;
  DivisionSubjectAssignment?: Array<{
    id?: string;
    Division?: { id: string; name: string } | null;
    Professor?: {
      id?: string;
      User?: { id?: string; name: string; email?: string } | null;
    } | null;
  }>;
};

type Tab = "my" | "all";

/* ── filter chip ────────────────────────────────── */
const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="px-3 py-1.5 rounded-full mr-2 mb-2"
    style={{
      backgroundColor: active ? colors.accent : colors.surface,
      borderWidth: 1,
      borderColor: active ? colors.accentBright + "50" : colors.border,
    }}
    activeOpacity={0.7}
  >
    <Text
      className="text-xs font-medium"
      style={{ color: active ? colors.accentBright : colors.textMuted }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/* ── main component ─────────────────────────────── */
export default function Subjects() {
  const router = useRouter();
  const userData = useAuthStore((s) => s.userData);

  const [activeTab, setActiveTab] = useState<Tab>("my");

  /* ── my subjects state ────────────────────── */
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [myLoading, setMyLoading] = useState(true);
  const [myRefreshing, setMyRefreshing] = useState(false);
  const [myError, setMyError] = useState<string | null>(null);

  /* ── all subjects state ───────────────────── */
  const [allSubjects, setAllSubjects] = useState<AllSubject[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allRefreshing, setAllRefreshing] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);
  const [allFetched, setAllFetched] = useState(false);

  /* ── filter options (from server) ─────────── */
  const [allDepartments, setAllDepartments] = useState<{ id: string; name: string }[]>([]);
  const [allSemesters, setAllSemesters] = useState<{ id: string; number: number; departmentId: string }[]>([]);
  const [filtersFetched, setFiltersFetched] = useState(false);

  /* ── filters ──────────────────────────────── */
  const [filterDept, setFilterDept] = useState<string | null>(null);
  const [filterSem, setFilterSem] = useState<number | null>(null);
  const [filterDiv, setFilterDiv] = useState<string | null>(null);

  /* ── fetch my subjects ────────────────────── */
  const fetchMySubjects = useCallback(async (refresh = false) => {
    if (!userData?.enrollmentNo) return;
    refresh ? setMyRefreshing(true) : setMyLoading(true);
    setMyError(null);
    try {
      const res = await api.get(`/assign-stu/my-subjects/${userData.enrollmentNo}`);
      setEnrollments(res.data?.data ?? []);
    } catch (err: any) {
      setMyError(extractErrorMessage(err));
    } finally {
      setMyLoading(false);
      setMyRefreshing(false);
    }
  }, [userData?.enrollmentNo]);

  /* ── fetch all subjects ───────────────────── */
  const fetchAllSubjects = useCallback(async (refresh = false) => {
    refresh ? setAllRefreshing(true) : setAllLoading(true);
    setAllError(null);
    try {
      const res = await api.get("/subject/all");
      setAllSubjects(res.data?.data?.subjects ?? []);
      setAllFetched(true);
    } catch (err: any) {
      setAllError(extractErrorMessage(err));
    } finally {
      setAllLoading(false);
      setAllRefreshing(false);
    }
  }, []);

  /* ── initial load ─────────────────────────── */
  useEffect(() => {
    fetchMySubjects();
  }, [fetchMySubjects]);

  /* ── fetch filter options ──────────────────── */
  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await api.get("/subject/filters");
      const data = res.data?.data;
      setAllDepartments(data?.departments ?? []);
      setAllSemesters(data?.semesters ?? []);
      setFiltersFetched(true);
    } catch (_) {
      /* silent – filters just won't show */
    }
  }, []);

  useEffect(() => {
    if (activeTab === "all" && !allFetched) fetchAllSubjects();
    if (activeTab === "all" && !filtersFetched) fetchFilterOptions();
  }, [activeTab, allFetched, fetchAllSubjects, filtersFetched, fetchFilterOptions]);

  /* ── my-division subjects ─────────────────── */
  const myDivSubjects: SubjectCardData[] = useMemo(() => {
    return enrollments
      .filter((e) => {
        const assigns = e.Subject.DivisionSubjectAssignment;
        if (!assigns) return false;
        return assigns.some((a) => a.Division?.name === userData?.division);
      })
      .map((e) => ({ ...e.Subject, enrollmentStatus: e.status }));
  }, [enrollments, userData?.division]);

  /* ── derive filter options ────────────────── */
  const departments = useMemo(
    () => allDepartments.map((d) => ({ id: d.id, name: d.name })),
    [allDepartments]
  );

  const semesters = useMemo(() => {
    const unique = new Map<number, string>();
    for (const s of allSemesters) {
      unique.set(s.number, `Sem ${s.number}`);
    }
    return Array.from(unique, ([num, label]) => ({ num, label })).sort((a, b) => a.num - b.num);
  }, [allSemesters]);

  const divisions = useMemo(() => {
    const divMap = new Map<string, string>();
    for (const subj of allSubjects) {
      for (const a of subj.DivisionSubjectAssignment ?? []) {
        if (a.Division) divMap.set(a.Division.id, a.Division.name);
      }
    }
    return Array.from(divMap, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allSubjects]);

  /* ── filtered all subjects ────────────────── */
  const filteredAll: SubjectCardData[] = useMemo(() => {
    return allSubjects
      .filter((subj) => {
        if (filterDept && subj.department?.id !== filterDept) return false;
        if (filterSem !== null && subj.semester?.number !== filterSem) return false;
        if (filterDiv) {
          const hasDivision = (subj.DivisionSubjectAssignment ?? []).some(
            (a) => a.Division?.id === filterDiv
          );
          if (!hasDivision) return false;
        }
        return true;
      })
      .map((subj) => ({
        id: subj.id,
        name: subj.name,
        code: subj.code,
        description: subj.description,
        semester: subj.semester ? { number: subj.semester.number } : null,
        department: subj.department,
        DivisionSubjectAssignment: subj.DivisionSubjectAssignment?.map((a) => ({
          id: a.id,
          Division: a.Division ? { id: a.Division.id, name: a.Division.name } : null,
          Professor: a.Professor
            ? { id: a.Professor.id, User: a.Professor.User ? { id: a.Professor.User.id, name: a.Professor.User.name, email: a.Professor.User.email } : null }
            : null,
        })),
      }));
  }, [allSubjects, filterDept, filterSem, filterDiv]);

  const hasActiveFilters = filterDept !== null || filterSem !== null || filterDiv !== null;

  /* ── navigate ─────────────────────────────── */
  const navigateToDetail = (subjectId: string) => {
    router.push({ pathname: "/screens/studentSubject/[id]", params: { id: subjectId } });
  };

  /* ── tab button ───────────────────────────── */
  const TabButton: React.FC<{ tab: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }> = ({
    tab,
    label,
    icon,
  }) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        onPress={() => setActiveTab(tab)}
        className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl"
        style={{
          backgroundColor: isActive ? colors.accent : "transparent",
          borderWidth: isActive ? 0 : 1,
          borderColor: isActive ? "transparent" : colors.border,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name={icon} size={16} color={isActive ? colors.accentBright : colors.textDim} />
        <Text className="text-sm font-semibold" style={{ color: isActive ? colors.accentBright : colors.textDim }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  /* ── render ───────────────────────────────── */
  const isLoading = activeTab === "my" ? myLoading : allLoading;
  const isRefreshing = activeTab === "my" ? myRefreshing : allRefreshing;
  const onRefresh = () => {
    if (activeTab === "my") fetchMySubjects(true);
    else fetchAllSubjects(true);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.primary }}>
      {/* ── Tab Switcher ─────────────────────── */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row gap-2">
          <TabButton tab="my" label="My Subjects" icon="school" />
          <TabButton tab="all" label="All Subjects" icon="library-outline" />
        </View>
      </View>

      {/* ── Filters (All tab only) ───────────── */}
      {activeTab === "all" && allFetched && (
        <View className="px-4 pb-2">
          {departments.length > 0 && (
            <View className="mb-1">
              <Text className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colors.textDim }}>
                Department
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {departments.map((d) => (
                  <FilterChip
                    key={d.id}
                    label={d.name}
                    active={filterDept === d.id}
                    onPress={() => setFilterDept(filterDept === d.id ? null : d.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {semesters.length > 0 && (
            <View className="mb-1">
              <Text className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colors.textDim }}>
                Semester
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {semesters.map((s) => (
                  <FilterChip
                    key={s.num}
                    label={s.label}
                    active={filterSem === s.num}
                    onPress={() => setFilterSem(filterSem === s.num ? null : s.num)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {divisions.length > 0 && (
            <View className="mb-1">
              <Text className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colors.textDim }}>
                Division
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {divisions.map((d) => (
                  <FilterChip
                    key={d.id}
                    label={d.name}
                    active={filterDiv === d.id}
                    onPress={() => setFilterDiv(filterDiv === d.id ? null : d.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={() => { setFilterDept(null); setFilterSem(null); setFilterDiv(null); }}
              className="self-start flex-row items-center gap-1 px-3 py-1.5 rounded-full mb-1"
              style={{ backgroundColor: colors.dangerMuted }}
            >
              <Ionicons name="close-circle" size={14} color={colors.dangerText} />
              <Text className="text-xs font-medium" style={{ color: colors.dangerText }}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Content ──────────────────────────── */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.accentBright} colors={[colors.accentBright]} />
        }
      >
        {isLoading ? (
          <View className="items-center mt-20">
            <ActivityIndicator size="large" color={colors.accentBright} />
            <Text className="mt-3 text-sm" style={{ color: colors.textMuted }}>Loading subjects…</Text>
          </View>
        ) : activeTab === "my" ? (
          /* ── My Subjects ──────────────────── */
          <>
            {myError && (
              <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: colors.dangerMuted }}>
                <Text style={{ color: colors.dangerText }}>{myError}</Text>
              </View>
            )}

            {myDivSubjects.length === 0 && !myError ? (
              <View className="items-center mt-16">
                <Ionicons name="book-outline" size={56} color={colors.textDim} />
                <Text className="mt-4 text-base" style={{ color: colors.textMuted }}>
                  No subjects assigned to your division yet
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center gap-2 mb-3 mt-1">
                  <Ionicons name="school" size={18} color={colors.accentBright} />
                  <Text className="text-lg font-bold" style={{ color: colors.textWhite }}>My Division</Text>
                  {userData?.division && (
                    <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.accent }}>
                      <Text className="text-xs font-medium" style={{ color: colors.accentBright }}>{userData.division}</Text>
                    </View>
                  )}
                </View>
                {myDivSubjects.map((subj) => (
                  <StudentSubjectCard key={subj.id} subject={subj} showStatus onPress={() => navigateToDetail(subj.id)} />
                ))}
              </>
            )}
          </>
        ) : (
          /* ── All Subjects ─────────────────── */
          <>
            {allError && (
              <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: colors.dangerMuted }}>
                <Text style={{ color: colors.dangerText }}>{allError}</Text>
              </View>
            )}

            {filteredAll.length === 0 && !allError ? (
              <View className="items-center mt-16">
                <Ionicons name="search-outline" size={56} color={colors.textDim} />
                <Text className="mt-4 text-base text-center" style={{ color: colors.textMuted }}>
                  {hasActiveFilters ? "No subjects match your filters" : "No subjects found"}
                </Text>
                {hasActiveFilters && (
                  <TouchableOpacity
                    onPress={() => { setFilterDept(null); setFilterSem(null); setFilterDiv(null); }}
                    className="mt-3 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: colors.accentBright }}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between mb-3 mt-1">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="library" size={18} color={colors.accentBright} />
                    <Text className="text-lg font-bold" style={{ color: colors.textWhite }}>All Subjects</Text>
                  </View>
                  <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.overlayLight }}>
                    <Text className="text-xs" style={{ color: colors.textLight }}>{filteredAll.length}</Text>
                  </View>
                </View>
                {filteredAll.map((subj) => (
                  <StudentSubjectCard key={subj.id} subject={subj} onPress={() => navigateToDetail(subj.id)} />
                ))}
              </>
            )}
          </>
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}