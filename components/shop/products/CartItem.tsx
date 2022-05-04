import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ellipsist } from '../../../util/stringUtils';

interface Props {
    id?: string;
    quantity: number;
    title: string;
    price: number;
    onRemove?: (id: string | undefined, title: string | undefined) => void;
    deletable: boolean;
}

export default function CartItem({ id, quantity, title, price, onRemove, deletable }: Props) {
    return (
        <View style={styles.mainWrap}>
            <Text style={styles.itemData}>
                <Text style={styles.quantity}>{quantity} </Text>
                <Text style={styles.commonText}>{ellipsist(title, 20)}</Text>
            </Text>
            <View style={styles.itemData}>
                <Text style={styles.commonText}>${price}</Text>
                {deletable && (
                    <TouchableOpacity
                        onPress={() => onRemove(id, title)}
                        style={styles.trashButton}
                    >
                        <Ionicons
                            name={Platform.OS === 'android' ? 'md-trash' : 'ios-trash'}
                            size={23}
                            color="red"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// Styles for this CartItem
const styles = StyleSheet.create({
    mainWrap: {
        padding: 10,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
    },
    itemData: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantity: {
        fontFamily: 'open-sans',
        color: '#888',
        fontSize: 16,
    },
    commonText: {
        fontFamily: 'open-sans-bold',
        fontSize: 16,
    },
    trashButton: {
        marginLeft: 20,
    },
});
