import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
    Text,
    StyleSheet,
    Platform,
    FlatList,
    Button,
    ActivityIndicator,
    View,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import ProductItem from './ProductItem';
import CusHeaderButton from '../../ui/CusHeaderButton';
import Center from '../../common/Center';

import Color from '../../../defaults/Color';

import * as CartActions from '../../../store/actions/cartActions';
import * as ProductsActions from '../../../store/actions/productsAction';
import * as AuthActions from '../../../store/actions/authActions';

export default function ProductsOverview() {
    const products = useSelector((state) => state.products.availableProducts);
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [errors, setErrors] = useState<null | undefined | string>();

    // Helpers with useCallback
    const loadProducts = useCallback(async () => {
        setErrors(null);
        setIsRefreshing(true);
        await dispatch(ProductsActions.fetchProducts());
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setIsRefreshing, setErrors]);

    // Efffects
    useLayoutEffect(() => {
        // Set navigation title
        navigation.setOptions({
            headerTitle: 'Products Overview',
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
                        iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
                        onPress={handleCartClick}
                    />
                </HeaderButtons>
            ),
        });
    }, [navigation]);

    let focusListener: any = null;
    useEffect(() => {
        focusListener = navigation.addListener('focus', async () => {
            loadProducts();
        });

        return () => {
            if (focusListener.remove !== undefined) this.focusListener.remove();
        };
    }, [loadProducts]);

    useEffect(() => {
        setIsLoading(true);
        loadProducts()
            .then(() => setIsLoading(false))
            .catch(async (e) => {
                if (e.message === '401') {
                    // Just delete token, and reAuth using refreshToken
                    await dispatch(AuthActions.tokenNullize());
                }
                setErrors(e.message);
            });
    }, [dispatch, loadProducts]);

    // Handlers
    const handleItemClick = (productId: string, productTitle: string) => {
        goTo('ProductsDetailScreen', { productId, productTitle });
    };
    const handleAddToCard = (product: {}) => {
        dispatch(CartActions.addToCart(product));
    };
    const handleCartClick = () => goTo('CartScreen');

    // Helpers
    const goTo = (location: string, option: {} = {}) => {
        navigation.navigate(location, option);
    };
    const toggleDrawer = () => navigation.toggleDrawer();

    // If has errors
    if (errors) {
        return (
            <Center fullCenter>
                <Text>Sorry - An error occured!</Text>
                <Button title="Try Again" onPress={loadProducts} color={Color.primary} />
            </Center>
        );
    }

    return isLoading ? (
        <Center fullCenter>
            <ActivityIndicator size="large" color={Color.primary} />
        </Center>
    ) : products.length === 0 ? (
        <Center fullCenter>
            <Text>It seems you don't have any product yet.</Text>
        </Center>
    ) : (
        <FlatList
            onRefresh={loadProducts}
            refreshing={isRefreshing}
            data={products}
            renderItem={({ item }) => (
                <ProductItem
                    id={item.id}
                    image={item.imageUrl}
                    title={item.title}
                    price={item.price}
                    onSelect={handleItemClick}
                >
                    <Button
                        color={Color.primary}
                        title="View Details"
                        onPress={() => handleItemClick(item.id, item.title)}
                    />
                    <Button
                        color={Color.primary}
                        title="To Cart"
                        onPress={() => handleAddToCard(item)}
                    />
                </ProductItem>
            )}
        />
    );
}

// Styles for this ProductsOverview
const styles = StyleSheet.create({});
