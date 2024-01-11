import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { StatusBar } from 'expo-status-bar';

import { styles } from '../styles/Styles';

function AuthScreen() {
    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <Title />
                <SignIn />
                <StatusBar style="auto" />
            </View>
        </SafeAreaProvider >
    );
}

function Title() {
    return (
        <View>
            <Text style={styles.title}>⚛️🔥💬{"\n\n"}Chat App</Text>
        </View>
    );
}

function SignIn() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        try {
            setLoading(true);
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
            navigation.navigate('Chat');
        } catch (error) {
            console.error(error);
            Alert.alert("Error signing in", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <GoogleSigninButton
                    style={styles.signInButton}
                    onPress={handleSignIn} />
            )}
        </View>
    );
}

export default AuthScreen;
