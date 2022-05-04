import React, { useState, useLayoutEffect } from 'react';
import { Text, StyleSheet, View, ScrollView, Image, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import NumberFormat from 'react-number-format';

import Color from '../../../defaults/Color';
import * as CartActions from '../../../store/actions/cartActions';

export default function ProductDetail() {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // The product id
    const { productId, productTitle }: any = route.params;
    // Get the specific product - Redux
    const selectedProd = useSelector((state) =>
        state.products.availableProducts.find((prod) => prod.id === productId)
    );

    // Efffects
    useLayoutEffect(() => {
        // Set navigation title
        navigation.setOptions({ title: productTitle });
    }, [navigation]);

    // Handlers
    const handleAddToCard = () => {
        dispatch(CartActions.addToCart(selectedProd));
    };

    return (
        <ScrollView>
            <Image style={styles.image} source={{ uri: selectedProd.imageUrl }} />
            <Button color={Color.primary} title="Add to Cart" onPress={handleAddToCard} />
            <NumberFormat
                value={selectedProd.price}
                displayType="text"
                thousandSeparator
                decimalSeparator="."
                prefix="P "
                renderText={(value) => <Text style={styles.price}>{value}</Text>}
            />
            <Text style={styles.description}>{selectedProd.description}</Text>
        </ScrollView>
    );
}

// Styles for this ProductDetail
const styles = StyleSheet.create({
    mainWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 300,
    },
    price: {
        fontFamily: 'open-sans-bold',
        fontSize: 20,
        color: '#888',
        textAlign: 'center',
        marginVertical: 20,
    },
    description: {
        fontFamily: 'open-sans',
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 20,
    },
});
