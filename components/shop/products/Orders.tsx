import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Text, StyleSheet, View, FlatList, Platform, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import CusHeaderButton from '../../ui/CusHeaderButton';
import OrderItem from './OrderItem';
import Center from '../../common/Center';

import * as OrdersActions from '../../../store/actions/ordersAction';

import Color from '../../../defaults/Color';

interface Props {}

export default function Orders() {
    const orders = useSelector((state) => state.orders.orders);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    // States
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Efffects
    useLayoutEffect(() => {
        // Set navigation title
        navigation.setOptions({
            headerTitle: 'Your Orders',
            headerLeft: () => (
                <HeaderButtons HeaderButtonComponent={CusHeaderButton}>
                    <Item
                        title="Cart"
                        iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                        onPress={toggleDrawer}
                    />
                </HeaderButtons>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        setIsLoading(true);
        fetchOrders();
        setIsLoading(false);
    }, [dispatch]);

    // Helpers
    const toggleDrawer = () => navigation.toggleDrawer();
    const fetchOrders = async () => {
        dispatch(OrdersActions.fetchOrders());
    };

    return isLoading ? (
        <Center fullCenter>
            <ActivityIndicator size="large" color={Color.primary} />
        </Center>
    ) : orders.length === 0 ? (
        <Center fullCenter>
            <Text>No orders available yet.</Text>
        </Center>
    ) : (
        <FlatList
            data={orders}
            keyExtractor={(order) => order.id}
            renderItem={({ item }) => (
                <OrderItem
                    id={item.id}
                    totalAmount={item.totalAmount}
                    date={item.date}
                    data={item}
                />
            )}
        />
    );
}

// Styles for this Orders
const styles = StyleSheet.create({
    mainWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
