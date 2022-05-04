import React, { useState, useEffect } from 'react';
import {
    Text,
    StyleSheet,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    Button,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import * as AuthActions from '../../../store/actions/authActions';

import GlobalStyle from '../../../defaults/GlobalStyle';
import Color from '../../../defaults/Color';

interface Props {}

export default function Auth() {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<null | string>();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    // Handlers
    const handleSignUp = async () => {
        const payload = {
            email,
            password,
        };
        setErrors(null);
        setIsLoading(true);
        try {
            await dispatch(AuthActions.signUp(payload));
        } catch (e) {
            setErrors(e.message);
        }
        setIsLoading(false);
    };

    const handleLogin = async () => {
        const payload = {
            email,
            password,
        };
        setErrors(null);
        setIsLoading(true);
        try {
            await dispatch(AuthActions.signIn(payload));
            navigation.navigate('ProductsOverviewScreen');
        } catch (e) {
            setErrors(e.message);
        }
        setIsLoading(false);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            // keyboardVerticalOffset={50}
        >
            <LinearGradient
                colors={GlobalStyle.globalGradients.lGradient}
                style={styles.selfGradient}
            >
                <View style={styles.mainWrap}>
                    <ScrollView>
                        <View style={styles.formWrap}>
                            <View style={styles.formControl}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={(val) => setEmail(val)}
                                    value={email}
                                    keyboardType="default"
                                    autoCapitalize="sentences"
                                    returnKeyType="next"
                                />
                            </View>
                            <View style={styles.formControl}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={(val) => setPassword(val)}
                                    value={password}
                                    keyboardType="default"
                                    secureTextEntry
                                    returnKeyType="done"
                                />
                            </View>
                            {isLoading ? (
                                <ActivityIndicator size="large" color={Color.primary} />
                            ) : (
                                <TouchableOpacity style={styles.mainBtn} onPress={handleLogin}>
                                    <Text style={styles.mainBtnText}>Sign In</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.lowerBox}>
                            <Text style={styles.lowerBoxText}>
                                Create an account!{' '}
                                <Text style={styles.lowerBoxInnerText}>Sign Up</Text>
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

// Styles for this Auth
const styles = StyleSheet.create({
    mainWrap: {
        // ...GlobalStyle.globalItem,
        margin: 20,
    },
    formWrap: {
        margin: 20,
    },
    formControl: {
        width: '100%',
        marginBottom: 26,
    },
    mainBtn: {
        backgroundColor: Color.accent,
        marginTop: 28,
        borderRadius: 5,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainBtnText: {
        color: '#a55343',
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontFamily: 'open-sans-bold',
        marginVertical: 8,
        color: '#d2d2d2',
    },
    input: {
        paddingHorizontal: 2,
        paddingVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        color: 'white',
    },
    selfGradient: {
        flex: 1,
        justifyContent: 'center',
    },
    lowerBox: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    lowerBoxText: {
        color: 'white',
    },
    lowerBoxInnerText: {
        color: Color.accent,
    },
});
