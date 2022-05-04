import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
    children: React.ReactNode;
    fullCenter?: boolean;
    newStyle?: object;
}

export default function Center({ children, fullCenter, newStyle }: Props) {
    return (
        <View style={{ ...styles.mainWrap, ...(fullCenter && styles.reallyCenter), ...newStyle }}>
            {children}
        </View>
    );
}

// Styles for this Center
const styles = StyleSheet.create({
    mainWrap: {
        alignItems: 'center',
    },
    reallyCenter: {
        flex: 1,
        justifyContent: 'center',
    },
});
