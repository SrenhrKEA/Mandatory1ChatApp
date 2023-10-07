import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage'
import { UserContext } from './../../contexts/UserContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

const db = firestore();
const messagesRef = db.collection('messages');
const serverTimestamp = firestore.FieldValue.serverTimestamp;

function ChatScreen() {
    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <Header />
                <ChatRoom />
                <StatusBar style="auto" />
            </View>
        </SafeAreaProvider>
    );
}

function Header() {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>⚛️🔥💬</Text>
            <Text style={styles.title}>Chat App</Text>
            <SignOut />
        </View>
    );
}

function SignOut() {
    const navigation = useNavigation();
    const user = useContext(UserContext)

    const signOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await auth().signOut();
            navigation.navigate('Auth');
        } catch (error) {
            console.error(error);
        }
    }

    return user && (
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text>Sign Out</Text>
        </TouchableOpacity>
    );
}

function ChatRoom() {
    const scrollViewRef = useRef();
    const [messages, setMessages] = useState([]);
    const [formValue, setFormValue] = useState('');
    const user = useContext(UserContext)

    // Permissions
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

    useEffect(() => {
        (async () => {
            // Requesting gallery permission
            const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasGalleryPermission(galleryPermission.status === 'granted');

            // Requesting camera permission
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === 'granted');
        })();
    }, []);

    useEffect(() => {
        const unsubscribe = messagesRef.orderBy('createdAt').limit(25)
            .onSnapshot(snapshot => {
                let fetchedMessages = [];
                snapshot.forEach(doc => {
                    fetchedMessages.push({ ...doc.data(), id: doc.id });
                });
                setMessages(fetchedMessages);
            });

        return () => unsubscribe();
    }, []);

    const sendMessage = async (e, imageUrl) => {
        e.preventDefault();

        const { uid, photoURL } = user;
        const messageContent = imageUrl ? imageUrl : formValue;

        try {
            await messagesRef.add({
                text: messageContent,
                createdAt: serverTimestamp(),
                uid,
                photoURL,
                messageType: imageUrl ? 'image' : 'text', // this distinguishes between text and image messages
            });

            setFormValue('');
            scrollViewRef.current.scrollToEnd({ animated: true });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            uploadImage(result.assets[0].uri);
        }
    };

    const captureImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            console.log(blob.size, blob.type);
            const ref = storage().ref().child(`media/${Date.now()}`);

            await ref.put(blob);

            // Use the ref directly to get the download URL
            const downloadURL = await ref.getDownloadURL();

            const { uid, photoURL } = user;
            await messagesRef.add({
                text: downloadURL,
                createdAt: serverTimestamp(),
                uid,
                photoURL,
                messageType: 'image',
            });

            scrollViewRef.current.scrollToEnd({ animated: true });
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView ref={scrollViewRef}>
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <View></View>
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={formValue}
                    onChangeText={setFormValue}
                    placeholder="Write a message..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!formValue}>
                    <Text>🕊️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={pickImage}
                    disabled={!hasGalleryPermission}>
                    <Text>🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={captureImage}
                    disabled={!hasCameraPermission}>
                    <Text>📸</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function ChatMessage(props) {
    const user = useContext(UserContext);

    if (!props.message || !user) return null; // this line prevents the rendering if message is undefined
    const { text, uid, photoURL, messageType } = props.message;

    return (
        <View style={[styles.message, uid === user.uid ? styles.sent : styles.received]}>
            <Image source={{ uri: photoURL || 'https://avatars.githubusercontent.com/u/100341300?v=4' }} style={styles.avatar} />
            {messageType === 'image' ?
                <Image source={{ uri: text }} style={styles.image} /> :
                <Text>{text}</Text>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 20,
        height: 40,
        marginRight: 10,
        width: 40,
    },
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
        padding: 10,
        width: '100%',
    },
    image: {
        borderRadius: 5,
        height: 150,
        width: 150,
    },
    input: {
        borderColor: 'gray',
        borderRadius: 5,
        borderWidth: 1,
        flex: 1,
        paddingLeft: 10,
    },
    inputContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
    },
    message: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
    },
    received: {
        alignSelf: 'flex-start',
        backgroundColor: 'lightgray',
    },
    sendButton: {
        backgroundColor: '#1DA1F2',
        borderRadius: 5,
        margin: 5,
        padding: 5,
    },
    sent: {
        alignSelf: 'flex-end',
        backgroundColor: 'lightblue',
    },
    signOutButton: {
        backgroundColor: '#1DA1F2',
        borderRadius: 5,
        fontWeight: 'bold',
        padding: 10,
    },
    title: {
        fontSize: 24,
    },
});

export default ChatScreen;
