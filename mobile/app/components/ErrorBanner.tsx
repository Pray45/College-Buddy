import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ErrorBannerProps {
  message?: string | null;
  onClose?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-row items-start mb-4">
      <View className="flex-1">
        <Text className="text-red-700 font-semibold">Something went wrong</Text>
        <Text className="text-red-600 mt-1">{message}</Text>
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} accessibilityLabel="Close error" className="pl-3 pt-1">
          <Text className="text-red-500 text-sm font-semibold">Close</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorBanner;
