import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { Picker } from "@react-native-picker/picker";
import { useSubjectStore } from '../../src/store/subjectStore';
import colors from '../../src/config/colors';

const CreateSubject = () => {

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

  const [createSub, setCreateSub] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<number | null>(null);
  const [semester, setSemester] = useState<number | null>(null);

  const { createSubject, loading, error } = useSubjectStore();

  const handleCreateSubject = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter subject name");
      return;
    }
    
    if (!code.trim()) {
      Alert.alert("Error", "Please enter subject code");
      return;
    }
    
    if (!description.trim()) {
      Alert.alert("Error", "Please enter subject description");
      return;
    }
    
    if (!department) {
      Alert.alert("Error", "Please select a department");
      return;
    }
    
    if (!semester) {
      Alert.alert("Error", "Please select a semester");
      return;
    }

    try {
      await createSubject({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        departmentId: department.toString(),
        semesterId: semester,
      });

      Alert.alert("Success", "Subject created successfully!");
      
      setName("");
      setCode("");
      setDescription("");
      setDepartment(null);
      setSemester(null);
      setCreateSub(false);
    } catch (err) {
      Alert.alert("Error", error || "Failed to create subject");
    }
  }

  return (
    <View className="bg-secondary p-5 rounded-2xl border border-white/10">

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setCreateSub((prev) => !prev)}
      >
        <Text className="text-white text-lg font-semibold">
          Create Subject
        </Text>
        <Text className="text-textMuted text-sm mt-1">
          Add a new subject for Semester {semester} of {DEPARTMENTS.find((dept) => dept.value === department)?.label} 
        </Text>
      </TouchableOpacity>

      {createSub && (
        <View className="mt-5">
          <Text className="text-white text-sm font-semibold mb-2">
            Subject Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Subject Name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            className="bg-surface px-4 h-12 rounded-md mb-4 text-white"
          />
          
          <Text className="text-white text-sm font-semibold mb-2">
            Subject Code
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Subject Code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            className="bg-surface px-4 h-12 rounded-md mb-4 text-white"
          />
          
          <Text className="text-white text-sm font-semibold mb-2">
            Subject Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Subject Description"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="sentences"
            className="bg-surface px-4 h-12 rounded-md mb-4 text-white"
          />
          

          <Text className="text-white text-sm font-semibold mb-2">
            Department
          </Text>
          <View className="bg-surface rounded-md mb-4 overflow-hidden">
            <Picker
              selectedValue={department}
              onValueChange={(value) => setDepartment(value)}
            >
              <Picker.Item label="Select Department" value={null} color={colors.textMuted} />
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
          <View className="bg-surface rounded-md mb-4 overflow-hidden">
            <Picker
              selectedValue={semester}
              onValueChange={(value) => setSemester(value)}
            >
              <Picker.Item label="Select Semester" value={null} color={colors.textMuted} />
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
            onPress={handleCreateSubject}
          >
            <Text className="text-black font-bold text-center">
              Create Subject
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  )
}

export default CreateSubject