import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/src/config/colors";

export type SubjectCardData = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  semester?: { number: number } | null;
  department?: { id?: string; name: string } | null;
  DivisionSubjectAssignment?: Array<{
    id?: string;
    Division?: { id?: string; name: string } | null;
    Professor?: {
      id?: string;
      User?: { id?: string; name: string; email?: string } | null;
    } | null;
  }>;
  enrollmentStatus?: string;
};

interface Props {
  subject: SubjectCardData;
  onPress: () => void;
  showStatus?: boolean;
}

const StudentSubjectCard: React.FC<Props> = ({ subject, onPress, showStatus }) => {
  const assignments = subject.DivisionSubjectAssignment ?? [];
  const firstAssignment = assignments[0];
  const professor = assignments.find((a) => a.Professor?.User?.name)?.Professor?.User?.name ?? null;
  const division = firstAssignment?.Division?.name ?? null;
  const statusColor =
    subject.enrollmentStatus === "ACTIVE" ? colors.accentBright : colors.warning;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: colors.secondary }}
    >
      {/* top row: code badge + status */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: colors.accent }}>
          <Text className="text-xs font-bold" style={{ color: colors.accentBright }}>
            {subject.code}
          </Text>
        </View>

        {showStatus && subject.enrollmentStatus && (
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
            <Text className="text-xs" style={{ color: statusColor }}>
              {subject.enrollmentStatus}
            </Text>
          </View>
        )}
      </View>

      {/* subject name */}
      <Text className="text-lg font-semibold mb-1" style={{ color: colors.textWhite }}>
        {subject.name}
      </Text>

      {/* description */}
      {subject.description ? (
        <Text className="text-sm mb-2" numberOfLines={2} style={{ color: colors.textSecondary }}>
          {subject.description}
        </Text>
      ) : null}

      {/* meta row */}
      <View
        className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1 pt-2"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        {subject.department && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="business-outline" size={14} color={colors.textDim} />
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {subject.department.name}
            </Text>
          </View>
        )}

        {subject.semester && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="layers-outline" size={14} color={colors.textDim} />
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              Sem {subject.semester.number}
            </Text>
          </View>
        )}

        {division && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={14} color={colors.textDim} />
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {division}
            </Text>
          </View>
        )}

        {professor && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="school-outline" size={14} color={colors.textDim} />
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {professor}
            </Text>
          </View>
        )}
      </View>

      {/* divisions count for all-subjects view */}
      {assignments.length > 1 && (
        <View className="flex-row items-center gap-1 mt-1.5">
          <Ionicons name="git-branch-outline" size={13} color={colors.textDim} />
          <Text className="text-xs" style={{ color: colors.textDim }}>
            {assignments.length} divisions assigned
          </Text>
        </View>
      )}

      {/* chevron */}
      <View className="absolute right-4 top-1/2">
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </View>
    </TouchableOpacity>
  );
};

export default StudentSubjectCard;
