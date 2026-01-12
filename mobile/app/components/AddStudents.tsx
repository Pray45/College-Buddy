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

  useEffect(() => {
    getDivisions();
  }, []);

  useEffect(() => {
    if (departmentId && semesterId) {
      const semester = parseInt(semesterId);
      fetchStudents({ departmentId, semester });
      setSelected([]);
    }
  }, [departmentId, semesterId]);

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
        fetchStudents({ departmentId, semester: parseInt(semesterId) });
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
        <Text className="text-gray-400 text-sm mt-1">
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
              <Picker.Item label="Select Department" value={null} color="#9ca3af" />
              {DEPARTMENTS.map((d) => (
                <Picker.Item key={d.value} label={d.label} value={d.value} color="#9ca3af"/>
              ))}
            </Picker>
          </View>

          {/* Semester Picker */}
          <View className="bg-black/30 rounded-xl mb-3">
            <Picker
              selectedValue={semesterId}
              onValueChange={(v) => setSemesterId(v)}
            >
              <Picker.Item label="Select Semester" value={null} color="#9ca3af" />
              {SEMESTERS.map((s) => (
                <Picker.Item key={s} label={`Semester ${s}`} value={s} color="#9ca3af" />
              ))}
            </Picker>
          </View>

          {/* Division Picker */}
          <View className="bg-black/30 rounded-xl mb-4">
            <Picker
              selectedValue={selectedDivisionId}
              onValueChange={(v) => setSelectedDivisionId(v)}
            >
              <Picker.Item label="Select Division" value={null} color="#9ca3af" />
              {divisions?.map((d) => (
                <Picker.Item
                  key={d.id}
                  label={`${d.name} (${d.departmentId})`}
                  value={d.id}
                  color="#9ca3af"
                />
              ))}
            </Picker>
          </View>

          {/* Student List */}
          <ScrollView className="max-h-80">
            {loading && <ActivityIndicator />}

            {error && (
              <Text className="text-red-400 text-sm mb-3">{error}</Text>
            )}

            {!loading &&
              students
                ?.filter((student) => student.divisionId === null)
                .map((student) => {
                  const isSelected = selected.includes(student.id);
                  const isAssigned = student.divisionId !== null;

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
                      <Text className="text-white font-semibold">
                        {student.User.name}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {student.enrollmentNo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

            {!loading && students?.length === 0 && (
              <Text className="text-gray-400 text-center mt-6">
                No students found
              </Text>
            )}
          </ScrollView>

          {/* Assign Button */}
          <TouchableOpacity
            disabled={selected.length === 0 || loading || !selectedDivisionId}
            onPress={handleAssign}
            className={`mt-5 p-4 rounded-xl ${
              selected.length === 0 || !selectedDivisionId
                ? "bg-gray-600"
                : "bg-accent"
            }`}
          >
            <Text className="text-white text-center font-semibold">
              Assign Selected ({selected.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default AssignStudents;
