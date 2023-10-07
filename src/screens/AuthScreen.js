import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { StatusBar } from 'expo-status-bar';

function AuthScreen() {
    const navigation = useNavigation();

    const onGoogleButtonPress = async () => {
        try {
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
            navigation.navigate('Chat');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <Text style={styles.title}>⚛️🔥💬</Text>
                <Text style={styles.title}>Chat App</Text>
                <GoogleSigninButton
                    style={styles.signInButton}
                    onPress={onGoogleButtonPress} />
                <StatusBar style="auto" />
            </View>
        </SafeAreaProvider>
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
