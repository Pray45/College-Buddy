import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { useDivisionStore } from "@/src/store/divisionStore";
import colors from "@/src/config/colors";

const DEPARTMENTS = [
  { label: "CSE", value: "1" },
  { label: "ECE", value: "2" },
  { label: "ME", value: "3" },
  { label: "EE", value: "4" },
  { label: "CIVIL", value: "5" },
];

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const AssignStudents = () => {
  const {
    students,
    fetchStudents,
    assignStudents,
    divisions,
    getDivisions,
    loading,
    error,
  } = useDivisionStore();

  const [isOpen, setIsOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [semesterId, setSemesterId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(
    null,
  );
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  useEffect(() => {
    getDivisions();
  }, []);

  // Reset students when department or semester changes
  useEffect(() => {
    setStudentsLoaded(false);
    setSelected([]);
  }, [departmentId, semesterId]);

  const handleLoadStudents = async () => {
    if (departmentId && semesterId) {
      const semester = parseInt(semesterId);
      await fetchStudents({ departmentId, semester });
      setStudentsLoaded(true);
      setSelected([]);
    }
  };

  const toggleStudent = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (!selectedDivisionId) {
      Alert.alert("Error", "Please select a division");
      return;
    }
    try {
      await assignStudents({
        divisionId: selectedDivisionId,
        studentIds: selected,
      });

      Alert.alert("Success", "Students assigned successfully");
      setSelected([]);
      // Refetch students to update their assignment status
      if (departmentId && semesterId) {
        await fetchStudents({ departmentId, semester: parseInt(semesterId) });
      }
    } catch {
      // error already handled in store
    }
  };

  return (
    <ScrollView className="bg-secondary p-5 rounded-2xl border border-white/10">
      {/* HEADER (clickable) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <Text className="text-white text-lg font-semibold">
          Assign Students to Division
        </Text>
        <Text className="text-textMuted text-sm mt-1">
          Select students and assign them to a division
        </Text>
      </TouchableOpacity>

      {/* FORM (conditional) */}
      {isOpen && (
        <View className="mt-5">
          {/* Department Picker */}
          <View className="bg-black/30 rounded-xl mb-3">
            <Picker
              selectedValue={departmentId}
              onValueChange={(v) => setDepartmentId(v)}
            >
              <Picker.Item label="Select Department" value={null} color={colors.textMuted} />
              {DEPARTMENTS.map((d) => (
                <Picker.Item key={d.value} label={d.label} value={d.value} color={colors.textMuted}/>
              ))}
            </Picker>
          </View>

          {/* Semester Picker */}
          <View className="bg-black/30 rounded-xl mb-3">
            <Picker
              selectedValue={semesterId}
              onValueChange={(v) => setSemesterId(v)}
            >
              <Picker.Item label="Select Semester" value={null} color={colors.textMuted} />
              {SEMESTERS.map((s) => (
                <Picker.Item key={s} label={`Semester ${s}`} value={s} color={colors.textMuted} />
              ))}
            </Picker>
          </View>

          {/* Load Students Button */}
          <TouchableOpacity
            disabled={!departmentId || !semesterId || loading}
            onPress={handleLoadStudents}
            className={`mb-4 p-4 rounded-xl ${
              !departmentId || !semesterId
                ? "bg-disabled"
                : "bg-info"
            }`}
          >
            {loading && !studentsLoaded ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <Text className="text-white text-center font-semibold">
                Load Students from Selected Branch & Semester
              </Text>
            )}
          </TouchableOpacity>

          {/* Student List - Only show after loading */}
          {studentsLoaded && (
            <>
              {/* Division Picker */}
              <View className="bg-black/30 rounded-xl mb-4">
                <Picker
                  selectedValue={selectedDivisionId}
                  onValueChange={(v) => setSelectedDivisionId(v)}
                >
                  <Picker.Item label="Select Division to Assign" value={null} color={colors.textMuted} />
                  {divisions?.map((d) => (
                    <Picker.Item
                      key={d.id}
                      label={`${d.name} (${d.departmentId})`}
                      value={d.id}
                      color={colors.textMuted}
                    />
                  ))}
                </Picker>
              </View>

              {/* Students Count */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white font-semibold">
                  Available Students ({students?.filter(s => s.divisionId === null).length || 0})
                </Text>
                {selected.length > 0 && (
                  <Text className="text-accent text-sm">
                    {selected.length} selected
                  </Text>
                )}
              </View>

              {/* Student List */}
              <ScrollView className="max-h-80">
                {loading && <ActivityIndicator />}

                {error && (
                  <Text className="text-dangerText text-sm mb-3">{error}</Text>
                )}

                {!loading &&
                  students
                    ?.filter((student) => student.divisionId === null)
                    .map((student) => {
                      const isSelected = selected.includes(student.id);

                      return (
                        <TouchableOpacity
                          key={student.id}
                          onPress={() => toggleStudent(student.id)}
                          className={`p-4 mb-3 rounded-xl border ${
                            isSelected
                              ? "bg-accent/20 border-accent"
                              : "border-white/10"
                          }`}
                        >
                          <View className="flex-row justify-between items-center">
                            <View>
                              <Text className="text-white font-semibold">
                                {student.User.name}
                              </Text>
                              <Text className="text-textMuted text-sm">
                                {student.enrollmentNo}
                              </Text>
                            </View>
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                              isSelected ? "bg-accent border-accent" : "border-disabled"
                            }`}>
                              {isSelected && (
                                <Text className="text-white text-xs">✓</Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                {!loading && students?.filter(s => s.divisionId === null).length === 0 && (
                  <Text className="text-textMuted text-center mt-6">
                    No unassigned students found
                  </Text>
                )}
              </ScrollView>

              {/* Assign to Division Button */}
              <TouchableOpacity
                disabled={selected.length === 0 || loading || !selectedDivisionId}
                onPress={handleAssign}
                className={`mt-5 p-4 rounded-xl ${
                  selected.length === 0 || !selectedDivisionId
                    ? "bg-disabled"
                    : "bg-success"
                }`}
              >
                <Text className="text-white text-center font-semibold">
                  {loading ? "Assigning..." : `Assign ${selected.length} Student(s) to Division`}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {!studentsLoaded && departmentId && semesterId && (
            <Text className="text-textMuted text-center mt-4">
              Click &quot;Load Students&quot; to view available students
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default AssignStudents;
