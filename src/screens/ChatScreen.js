import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { UserContext } from './../../contexts/UserContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const db = firestore();
const serverTimestamp = firestore.FieldValue.serverTimestamp;

function ChatScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Header />
            <ChatRoom />
        </View>
    );
}

function Header() {
    return (
        <View style={{ alignItems: 'center', padding: 10 }}>
            <Text style={{ fontSize: 24 }}>⚛️🔥💬</Text>
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
    const messagesRef = db.collection('messages');
    const [messages, setMessages] = useState([]);
    const [formValue, setFormValue] = useState('');
    const user = useContext(UserContext)

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

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = user;

        await messagesRef.add({
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL
        });

        setFormValue('');
        scrollViewRef.current.scrollToEnd({ animated: true });
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView ref={scrollViewRef}>
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <View></View>
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={formValue}
                    onChangeText={setFormValue}
                    placeholder="say something nice"
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!formValue}>
                    <Text>🕊️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function ChatMessage(props) {
    const user = useContext(UserContext);

    if (!props.message || !user) return null; // this line prevents the rendering if message is undefined
    const { text, uid, photoURL } = props.message;

    return (
        <View style={[styles.message, uid === user.uid ? styles.sent : styles.received]}>
            <Image source={{ uri: photoURL || 'https://avatars.githubusercontent.com/u/100341300?v=4' }} style={styles.avatar} />
            <Text>{text}</Text>
        </View>
    );
}

ChatMessage.defaultProps = {
    message: {
        uid: '',
        photoURL: ''
    }
};

const styles = StyleSheet.create({
    signOutButton: {
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        marginRight: 10,
    },
    sendButton: {
        padding: 10,
        backgroundColor: 'blue',
        borderRadius: 5,
    },
    message: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    sent: {
        alignSelf: 'flex-end',
        backgroundColor: 'lightblue',
    },
    received: {
        alignSelf: 'flex-start',
        backgroundColor: 'lightgray',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
});


export default ChatScreen;
