import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const _layout = () => { 
  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: '#161B22',
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
        paddingTop: 10,
      }
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarIcon: ({ color }) => (<Ionicons name="home" size={24} color={color} />)
      }}
      />
      <Tabs.Screen name="student" options={{
        title: 'Student',
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarIcon: ({ color }) => (<Ionicons name="book" size={24} color={color} />)
      }}
      />
      <Tabs.Screen name="project" options={{
        title: 'Project',
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarIcon: ({ color }) => (<Ionicons name="code" size={24} color={color} />)
      }}
      />
      <Tabs.Screen name="GECP" options={{
        title: 'GECP',
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarIcon: ({ color }) => (<Ionicons name="school" size={24} color={color} />)
      }}
      />
      <Tabs.Screen name="notification" options={{
        tabBarBadge: 3,
        title: 'Notifications',
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarIcon: ({ color }) => (<Ionicons name="notifications" size={24} color={color} />)
      }}
      />

    </Tabs>
  )
}

export default _layout