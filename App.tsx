import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import * as firebase from 'firebase/app';
import 'firebase/storage';

// Navigation
import MainNavigator from './navigation/MainNavigator';

// Firebase config
import firebaseConfig from './configs/firebase-config';

// Utils
import { dbInit } from './data/db/db';

// Redux Persister
import { store, persistor } from './store/store';

// DB SQL initialization
// dbInit()
//     .then(() => console.log('DB Initialized'))
//     .catch((err) => console.log('DB Init Failed!'));

// Firebase
if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);

export default function App() {
    let [fontsLoaded] = useFonts({
        'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
        'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    });

    // Let the fonts load first
    if (!fontsLoaded) {
        return <AppLoading />;
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <MainNavigator />
                <StatusBar style="auto" />
            </PersistGate>
        </Provider>
    );
}
