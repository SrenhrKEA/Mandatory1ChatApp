import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        marginTop: 10,
        marginBottom: 20,
    },
    // title: {
    //     fontSize: 24,
    // },
    signOutButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#1DA1F2',
        fontWeight: 'bold',
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        width: '100%', // Ensures the message container takes up the full width
    },
    sentMessageContainer: {
        justifyContent: 'flex-end', // Right-align for sent messages
    },
    receivedMessageContainer: {
        justifyContent: 'flex-start', // Left-align for received messages
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
        marginRight: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    input: {
        flex: 1,
        paddingLeft: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
    },
    sendButton: {
        padding: 5,
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#1DA1F2',
    },
});
