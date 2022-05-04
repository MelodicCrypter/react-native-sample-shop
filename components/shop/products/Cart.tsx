import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Button, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import CartItem from './CartItem';

import { numFixer } from '../../../util/numberUtils';

import * as CartActions from '../../../store/actions/cartActions';
import * as OrderActions from '../../../store/actions/ordersAction';

import GlobalStyle from '../../../defaults/GlobalStyle';
import Color from '../../../defaults/Color';

interface Props {}

export default function Cart() {
    const dispatch = useDispatch();
    const cartTotalAmount = useSelector((state) => state.cart.totalAmount);
    const cartItems = useSelector((state) => {
        const cartItemsArray = [];
        for (const key in state.cart.items) {
            cartItemsArray.push({
                productId: key,
                productTitle: state.cart.items[key].productTitle,
                productPrice: state.cart.items[key].productPrice,
                quantity: state.cart.items[key].quantity,
                sum: state.cart.items[key].sum,
            });
        }
        return cartItemsArray.sort((a, b) => (a.productId > b.productId ? 1 : -1));
    });

    // States
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Handlers
    const handleRemoveProduct = (id: string | undefined, title: string | undefined) => {
        Alert.alert(
            'Are you sure?',
            `Will delete ${title}`,
            [
                {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        dispatch(CartActions.removeFromCart({ id }));
                    },
                },
            ],
            { cancelable: false }
        );
    };
    const handleAddOrder = async (items: {}, totalAmount: number) => {
        setIsLoading(true);
        const payload = {
            items,
            totalAmount,
        };
        await dispatch(OrderActions.addOrder(payload));
        await dispatch(CartActions.resetCart());
        setIsLoading(false);
    };

    return (
        <View style={styles.mainWrap}>
            <View style={styles.overviewWrap}>
                <Text style={styles.overviewText}>
                    Total: <Text style={styles.overviewAmount}> ${numFixer(cartTotalAmount)}</Text>
                </Text>
                {isLoading ? (
                    <ActivityIndicator size="small" color={Color.primary} />
                ) : (
                    <Button
                        color={Color.accent}
                        title="Order Now"
                        disabled={cartItems.length === 0}
                        onPress={() => handleAddOrder(cartItems, cartTotalAmount)}
                    />
                )}
            </View>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.productId}
                renderItem={({ item }) => (
                    <CartItem
                        id={item.productId}
                        quantity={item.quantity}
                        title={item.productTitle}
                        price={item.productPrice}
                        onRemove={handleRemoveProduct}
                        deletable
                    />
                )}
            />
        </View>
    );
}

// Styles for this CartScreen
const styles = StyleSheet.create({
    mainWrap: {
        margin: 20,
    },
    overviewWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: 10,
        ...GlobalStyle.globalItem,
    },
    overviewText: {
        fontFamily: 'open-sans-bold',
        fontSize: 18,
    },
    overviewAmount: {
        color: Color.primary,
    },
    itemsWrap: {},
});
