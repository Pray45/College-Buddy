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
                    title: "profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="requestHandle"
                options={{
                    title: "requests",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
