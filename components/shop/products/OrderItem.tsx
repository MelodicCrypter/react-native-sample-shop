import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Button } from 'react-native';
import moment from 'moment';

import CartItem from './CartItem';

import Color from '../../../defaults/Color';
import GlobalStyle from '../../../defaults/GlobalStyle';

interface Props {
    id: string;
    totalAmount: number;
    date: Date;
    data: [];
}

export default function OrderItem({ id, totalAmount, date, data }: Props) {
    const [showDetails, setShowDetails] = useState(false);

    // Handler
    const handleBtnClick = () => setShowDetails(!showDetails);

    return (
        <View style={styles.mainWrap}>
            <View style={styles.summary}>
                <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
                <Text style={styles.date}>{moment(date).format('MMM D, YYYY, hh:mm a')}</Text>
            </View>
            <View style={styles.orderIdWrap}>
                <Text style={styles.orderIdTitle}>
                    ID:{' '}
                    <View style={styles.orderIdSubWrap}>
                        <Text style={styles.orderIdSubText}>{id}</Text>
                    </View>
                </Text>
            </View>
            <Button
                color={Color.primary}
                title={showDetails ? 'Hide Details' : 'Show Details'}
                onPress={handleBtnClick}
            />

            {showDetails && (
                <View key={id}>
                    {data.items.map(
                        (item: {
                            id: string;
                            quantity: number;
                            productTitle: string;
                            productPrice: number;
                        }) => (
                            <CartItem
                                quantity={item.quantity}
                                title={item.productTitle}
                                price={item.productPrice}
                                deletable={false}
                            />
                        )
                    )}
                </View>
            )}
        </View>
    );
}

// Styles for this OrderItem
const styles = StyleSheet.create({
    mainWrap: {
        ...GlobalStyle.globalItem,
        margin: 20,
        padding: 10,
    },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    orderIdWrap: {
        width: '100%',
        marginBottom: 24,
    },
    orderIdTitle: {
        fontFamily: 'open-sans-bold',
        fontSize: 16,
    },
    orderIdSubWrap: {
        paddingLeft: 20,
    },
    orderIdSubText: {
        fontFamily: 'open-sans',
        fontSize: 14,
    },
    totalAmount: {
        fontFamily: 'open-sans-bold',
        fontSize: 16,
    },
    date: {
        fontFamily: 'open-sans',
        fontSize: 16,
        color: '#888',
    },
});
