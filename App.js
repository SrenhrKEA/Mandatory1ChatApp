import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'expo-dev-client';
import auth from '@react-native-firebase/auth';
import { enableScreens } from 'react-native-screens';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { UserContext } from './contexts/UserContext';
import AuthScreen from './src/screens/AuthScreen';
import ChatScreen from './src/screens/ChatScreen';
import MapScreen from './src/screens/MapScreen';

// Configurations
enableScreens()
GoogleSignin.configure({
  webClientId: '304353663602-dr756veq7tgt276lovrjn0hao03atgn1.apps.googleusercontent.com',
})

const Stack = createStackNavigator();

function App() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; //unsubscribe on unmount
  }, [])

  if (initializing) return null;

  return (
    <UserContext.Provider value={user}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={user ? "Chat" : "Auth"}>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Map" component={MapScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  )
}

export default App;