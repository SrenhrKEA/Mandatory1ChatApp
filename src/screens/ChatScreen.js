import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

import { styles } from '../styles/Styles';
import { UserContext } from './../../contexts/UserContext';
import { DEFAULT_AVATAR_URL } from '../constants/Constants';

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

function ChatRoom() {
    const db = firestore();
    const messagesRef = db.collection('messages');
    const serverTimestamp = firestore.FieldValue.serverTimestamp;

    const scrollViewRef = useRef();
    const [messages, setMessages] = useState([]);
    const [formValue, setFormValue] = useState('');
    const user = useContext(UserContext)

    // Permissions
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(null);

    useEffect(() => {
        (async () => {
            // Requesting gallery permission
            const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasGalleryPermission(galleryPermission.status === 'granted');

            // Requesting camera permission
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === 'granted');

            // Requesting location permission
            const locationPermission = await Location.requestForegroundPermissionsAsync();
            setHasLocationPermission(locationPermission.status === 'granted');

            // Checking and alerting on any denied permission
            if (!galleryPermission.granted) {
                Alert.alert("Permission Denied", "Access to the gallery is needed.");
            }
            if (!cameraPermission.granted) {
                Alert.alert("Permission Denied", "Camera access is needed.");
            }
            if (!locationPermission.granted) {
                Alert.alert("Permission Denied", "Location access is needed.");
            }
        })();
    }, []);


    //Fetching messages
    useEffect(() => {
        const unsubscribe = messagesRef.orderBy('createdAt').limit(25)
            .onSnapshot(snapshot => {
                let fetchedMessages = [];
                snapshot.forEach(doc => {
                    fetchedMessages.push({ ...doc.data(), id: doc.id });
                });
                setMessages(fetchedMessages);
            }, error => {
                console.error("Error fetching messages:", error);
                Alert.alert("Error", "There was an issue fetching chat messages.");
            });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        const { uid, photoURL } = user;
        const messageContent = formValue.trim();

        if (messageContent) {
            try {
                const messageData = {
                    text: messageContent,
                    createdAt: serverTimestamp(),
                    uid,
                    photoURL,
                    messageType: 'text',
                };

                if (hasLocationPermission) {
                    const location = await getLocation();
                    if (location) {
                        messageData.location = new firestore.GeoPoint(location.coords.latitude, location.coords.longitude);
                    }
                }

                await messagesRef.add(messageData);

                setFormValue('');
                scrollViewRef.current.scrollToEnd({ animated: true });
            } catch (error) {
                console.error("Error sending message:", error);
                Alert.alert("Error", "There was an issue sending your message.");
            };
        }
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                quality: 0.5,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (result.canceled) {
                return;
            }

            if (!result.assets || result.assets.length === 0) {
                Alert.alert("Error", "No image was selected. Please try again.");
                return;
            }

            uploadImage(result.assets[0].uri);
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "There was an issue picking an image.");
        }
    };

    const captureImage = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                uploadImage(result.assets[0].uri);
            };
        } catch (error) {
            console.error("Error uploading image:", error);
            Alert.alert("Error", "There was an issue uploading your image.");
        }
    };

    const uploadImage = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const ref = storage().ref().child(`media/${Date.now()}`);

            await ref.put(blob);
            const downloadURL = await ref.getDownloadURL();

            const { uid, photoURL } = user;
            const messageData = {
                text: downloadURL,
                createdAt: serverTimestamp(),
                uid,
                photoURL,
                messageType: 'image',
            };

            if (hasLocationPermission) {
                const location = await getLocation();
                if (location) {
                    messageData.location = new firestore.GeoPoint(location.coords.latitude, location.coords.longitude);
                }
            }

            await messagesRef.add(messageData);

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
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                    disabled={!formValue}
                    accessibilityLabel="Send text message">
                    <Text>🕊️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={pickImage}
                    disabled={!hasGalleryPermission}
                    accessibilityLabel="Send image/video from gallery">
                    <Text>🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={captureImage}
                    disabled={!hasCameraPermission}
                    accessibilityLabel="Send image/video taken with camera">
                    <Text>📸</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function ChatMessage(props) {
    const user = useContext(UserContext);
    const navigation = useNavigation();
    const [lastTap, setLastTap] = useState(null);

    if (!props.message || !user) return null;
    const { text, uid, photoURL, messageType, location } = props.message;
    const isSentByUser = uid === user.uid;

    const handleTap = () => {
        const now = Date.now();
        if (lastTap && (now - lastTap) < 300) {
            // Detected double tap
            setLastTap(null); // Reset lastTap
            if (location) {
                navigation.navigate('Map', { location: props.message.location });
            }
        } else {
            setLastTap(now); // Set the current time as lastTap
        }
    };

    return (
        <TouchableOpacity onPress={handleTap} activeOpacity={0.7}>
            <View style={[
                styles.messageContainer,
                isSentByUser ? styles.sentMessageContainer : styles.receivedMessageContainer
            ]}>
                <Image source={{ uri: photoURL || DEFAULT_AVATAR_URL }} style={styles.avatar} />
                {messageType === 'image' ? (
                    <Image source={{ uri: text }} style={styles.image} />
                ) : (
                    <Text>{text}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

function SignOut() {
    const navigation = useNavigation();
    const user = useContext(UserContext);

    const handleSignOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await auth().signOut();
            navigation.navigate('Auth');
        } catch (error) {
            console.error(error);
            Alert.alert("Error signing out", error.message);
        };
    };

    return user && (
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text>Sign Out</Text>
        </TouchableOpacity>
    );
}

async function getLocation() {
    try {
        let location = await Location.getCurrentPositionAsync({});
        return location;
    } catch (error) {
        console.error("Error getting location:", error);
        return null;
    }
}

export default ChatScreen;
