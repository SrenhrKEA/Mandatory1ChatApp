import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { auth } from '../../firebase/firebaseConfig';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth'


function AuthScreen() {

    const navigation = useNavigation();

    const onGoogleButtonPress = async () => {
        // Get users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        //Sign-in the user with the credential
        const user_sign_in = auth().signInWithCredential(googleCredential);
        user_sign_in
            .then((user) => {
                console.log(user);
                navigation.navigate('Chat');
            })
            .catch((error) => {
                console.log(error);
            })
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24 }}>⚛️🔥💬</Text>
            <GoogleSigninButton
                style={{ width: 300, height: 65, marginTop: 300 }}
                onPress={onGoogleButtonPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    signInButton: {
        padding: 10,
        backgroundColor: '#4285F4',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default AuthScreen;
