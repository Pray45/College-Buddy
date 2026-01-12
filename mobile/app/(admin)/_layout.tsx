import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AdminTabs() {
    return (
        <Tabs screenOptions={
            { headerShown: false,
              tabBarStyle: {
                  backgroundColor: '#161B22',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 70,
                  paddingTop: 10,
              }}}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="requestHandle"
                options={{
                    title: "Requests",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-add" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="divisionHandler"
                options={{
                    title: "Divisions",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="business-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="SubjectHandler"
                options={{
                    title: "Subjects",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
