import "../global.css";
import Ionicons from "@expo/vector-icons/build/Ionicons.js";
import RecentUpdates from "../components/RecentUpdates";
import Quicklinks from "../components/Quicklinks";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import UpcomingEvents from "../components/UpcomingEvents";
import { Redirect, useRouter } from "expo-router";
import useAuthStore from "../store/authStore";

export default function App() {

  const router = useRouter();
  const isLoggedin = useAuthStore((state) => state.isLoggedin) 
  
  if (!isLoggedin) return <Redirect href="/(auth)/log-in" />;

  const updates = [
    {
      title: "New Semester Begins",
      description: "Welcome back! The new semester starts on September 1st. Check your schedule and get ready for exciting courses!"
    },
    {
      title: "Campus Safety Measures",
      description: "Please remember to follow the updated campus safety guidelines to ensure a safe environment for everyone."
    },
    {
      title: "Library Renovation",
      description: "The campus library is undergoing renovations to provide better study spaces and resources. Stay tuned for updates!"
    },
  ];

  const events = [
    {
      title: "Tech Fest \"Innovate 2024\"",
      day: "15",
      month: "OCT",
      location: "Main Auditorium"
    },
    {
      title: "Guest Lecture on AI",
      day: "20",
      month: "OCT",
      location: "Seminar Hall 1"
    },
    {
      title: "Cultural Fest 2024",
      day: "25",
      month: "OCT",
      location: "Main Lawn"
    },
    {
      title: "Hackathon Weekend",
      day: "28",
      month: "OCT",
      location: "Computer Lab"
    },
  ];

  return (
    <ScrollView className="bg-primary w-full h-full">
      <Text className="mt-16 text-textTheme text-5xl font-bold text-center">
        Empowering
        <Text className="text-textPrimary font-bold"> GTU</Text>
      </Text>
      <Text className="mt-3 text-textTheme text-5xl font-semibold text-center">
        Students
      </Text>

      <View className="mt-16 flex-row justify-between px-5">
        <View className="flex-row items-center gap-3">
          <Ionicons name="time-outline" size={28} color="white" />
          <Text className="text-textTheme text-2xl font-semibold">
            Recent updates
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/notification')}>
          <Text className="mt-2 text-textPrimary text-sm">View All</Text>
        </TouchableOpacity>
      </View>

      <RecentUpdates updates={updates} />

      <Quicklinks />

      <UpcomingEvents events={events} />

      <Text className="mb-10 text-center text-textSecondary">
        © 2024 College Buddy. All rights reserved.
      </Text>

    </ScrollView>
  )
}