import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { StatusBar } from 'expo-status-bar';

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

    const handleSignIn = async () => {
        try {
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
            navigation.navigate('Chat');
        } catch (error) {
            console.error(error);
            Alert.alert("Error signing in", error.message);
        }
    };

    return (
        <View>
            <GoogleSigninButton
                style={styles.signInButton}
                onPress={handleSignIn} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signInButton: {
        width: 200,
        height: 65,
        marginTop: 30,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default AuthScreen;
