import React, { useState, useEffect } from 'react';
import {
    Text,
    StyleSheet,
    View,
    Image,
    Button,
    TouchableOpacity,
    TouchableNativeFeedback,
    Platform,
} from 'react-native';
import NumberFormat from 'react-number-format';

import Center from '../../common/Center';
import Color from '../../../defaults/Color';

interface Props {
    id?: string;
    image: string;
    title: string;
    price: number;
    onSelect: (id: string, title: string) => void;
    children: React.ReactNode;
}

export default function ProductItem({ id, image, title, price, onSelect, children }: Props) {
    let TouchableCustom = TouchableOpacity;

    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCustom = TouchableNativeFeedback;
    }

    return (
        <TouchableCustom onPress={() => onSelect(id, title)}>
            <View style={styles.mainWrap}>
                <View style={styles.imageWrap}>
                    <Image style={styles.image} source={{ uri: image }} />
                </View>
                <Center newStyle={styles.forNewStyle}>
                    <Text style={styles.title}> {title} </Text>
                    <NumberFormat
                        value={price}
                        displayType="text"
                        thousandSeparator
                        decimalSeparator="."
                        prefix="P "
                        renderText={(value) => <Text style={styles.price}>{value}</Text>}
                    />
                </Center>
                <View style={styles.actions}>{children}</View>
            </View>
        </TouchableCustom>
    );
}

// Styles for this ProductItem
const styles = StyleSheet.create({
    mainWrap: {
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
        borderRadius: 10,
        backgroundColor: 'white',
        height: 300,
        margin: 20,
    },
    imageWrap: {
        width: '100%',
        height: '60%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontFamily: 'open-sans-bold',
        fontSize: 18,
        marginVertical: 2,
    },
    price: {
        fontFamily: 'open-sans-bold',
        fontSize: 14,
        color: '#888',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '13%',
        paddingHorizontal: 20,
    },
    forNewStyle: {
        alignItems: 'center',
        height: '17%',
        padding: 10,
    },
});
