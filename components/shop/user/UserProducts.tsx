import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Text, StyleSheet, View, FlatList, Platform, Button, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useNavigation } from '@react-navigation/native';

import ProductItem from '../products/ProductItem';
import CusHeaderButton from '../../ui/CusHeaderButton';

import Color from '../../../defaults/Color';

import * as ProductsActions from '../../../store/actions/productsAction';
import * as CartActions from '../../../store/actions/cartActions';

interface Props {
    test?: string;
}

export default function UserProducts({ test }: Props) {
    const userProducts = useSelector((state) => state.products.userProducts);
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Efffects
    useLayoutEffect(() => {
        // Set navigation title
        navigation.setOptions({
            headerTitle: 'Own Products',
            headerLeft: () => (
                <HeaderButtons HeaderButtonComponent={CusHeaderButton}>
                    <Item
                        title="Cart"
                        iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                        onPress={toggleDrawer}
                    />
                </HeaderButtons>
            ),
            headerRight: () => (
                <HeaderButtons HeaderButtonComponent={CusHeaderButton}>
                    <Item
                        title="Cart"
                        iconName={Platform.OS === 'android' ? 'md-add' : 'ios-add'}
                        onPress={() => goTo('EditProductScreen')}
                    />
                </HeaderButtons>
            ),
        });
    }, [navigation]);

    // Handlers
    const handleEditItem = (id: string) => {
        dispatch(ProductsActions.setProductToEdit({ id }));
        goTo('EditProductScreen', { productId: id });
    };
    const handleDeleteBtn = (id: string, title: string) => {
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
                        dispatch(ProductsActions.deleteProduct({ id }));
                        dispatch(CartActions.removeFromCart({ id }));
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // Helpers
    const goTo = (location: string, option: {} = {}) => {
        navigation.navigate(location, option);
    };
    const toggleDrawer = () => navigation.toggleDrawer();

    return (
        <FlatList
            data={userProducts}
            renderItem={({ item }) => (
                <ProductItem
                    image={item.imageUrl}
                    title={item.title}
                    price={item.price}
                    onSelect={() => handleEditItem(item.id)}
                >
                    <Button
                        color={Color.primary}
                        title="Edit"
                        onPress={() => handleEditItem(item.id)}
                    />
                    <Button
                        color={Color.primary}
                        title="Delete"
                        onPress={() => handleDeleteBtn(item.id, item.title)}
                    />
                </ProductItem>
            )}
        />
    );
}

// Styles for this UserProducts
const styles = StyleSheet.create({
    mainWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
