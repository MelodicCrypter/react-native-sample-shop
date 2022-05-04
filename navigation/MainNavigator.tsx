import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

// Screens
import ProductsOverviewScreen from '../screens/shop/ProductsOverviewScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CartScreen from '../screens/shop/CartScreen';
import OrdersScreen from '../screens/shop/OrdersScreen';
import UserProductsScreen from '../screens/user/UserProductsScreen';
import EditProductScreen from '../screens/user/EditProductScreen';
import AuthScreen from '../screens/user/AuthScreen';

import * as AuthActions from '../store/actions/authActions';

import Color from '../defaults/Color';

// Stacks Initiation
const AuthStack = createStackNavigator();
const ProductsStack = createStackNavigator();
const UserProductStack = createStackNavigator();
const OrdersStack = createStackNavigator();
const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator();

// Stack Screens and Groupings
const AuthStackScreen = () => (
    <AuthStack.Navigator headerMode="none">
        <AuthStack.Screen name="SignInScreen" component={AuthScreen} />
    </AuthStack.Navigator>
);

const ProductsStackScreen = () => (
    <ProductsStack.Navigator>
        <ProductsStack.Screen name="ProductsOverviewScreen" component={ProductsOverviewScreen} />
        <ProductsStack.Screen name="ProductsDetailScreen" component={ProductDetailScreen} />
        <ProductsStack.Screen name="CartScreen" component={CartScreen} />
    </ProductsStack.Navigator>
);

const OrdersStackScreen = () => (
    <OrdersStack.Navigator>
        <OrdersStack.Screen name="OrdersScreen" component={OrdersScreen} />
    </OrdersStack.Navigator>
);

const UserProductStackScreen = () => (
    <UserProductStack.Navigator>
        <UserProductStack.Screen name="UserProductScreen" component={UserProductsScreen} />
        <UserProductStack.Screen name="EditProductScreen" component={EditProductScreen} />
    </UserProductStack.Navigator>
);

// Drawer Nav: that holds specific group of stack screens
const DrawerScreen = () => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        Alert.alert(
            'Are you sure?',
            'You want to log out?',
            [
                {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: () => {
                        dispatch(AuthActions.logout());
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <Drawer.Navigator
            drawerContentOptions={{
                activeBackgroundColor: Color.accent,
                activeTintColor: Color.primary,
            }}
            drawerContent={(props) => (
                <DrawerContentScrollView {...props}>
                    <DrawerItemList {...props} />
                    {/*<DrawerItem {...props} />*/}
                    <Button title="Logout" color={Color.primary} onPress={handleLogout} />
                </DrawerContentScrollView>
            )}
        >
            <Drawer.Screen
                name="Products"
                component={ProductsStackScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <Ionicons
                            name={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
                            size={23}
                            color={color}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="Orders"
                component={OrdersStackScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <Ionicons
                            name={Platform.OS === 'android' ? 'md-list' : 'ios-list'}
                            size={23}
                            color={color}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="Account"
                component={UserProductStackScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <Ionicons
                            name={Platform.OS === 'android' ? 'md-cog' : 'ios-cog'}
                            size={23}
                            color={color}
                        />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};

// The most main Screen holding all navs
const RootStackScreen = ({ token, allPassed }) => (
    <RootStack.Navigator headerMode="none">
        {token && allPassed ? (
            <RootStack.Screen name="MainApp" component={DrawerScreen} />
        ) : (
            <RootStack.Screen name="Auth" component={AuthStackScreen} />
        )}
    </RootStack.Navigator>
);

// The Component returned
export default function MainNavigator() {
    const token = useSelector((state) => state.auth.token);
    const refreshToken = useSelector((state) => state.auth.refreshToken);
    const dispatch = useDispatch();

    const [allPassed, setAllPassed] = useState<boolean>(false);

    const checkIfReAuth = useCallback(() => {
        if (!allPassed && !token && refreshToken) {
            const payload = { token: refreshToken };
            dispatch(AuthActions.reAuthToken(payload));
            setAllPassed(true);
        } else if (token && refreshToken) {
            setAllPassed(true);
        } else {
            setAllPassed(false);
        }
    }, [token, refreshToken, allPassed, dispatch]);

    useEffect(() => {
        checkIfReAuth();
    }, [checkIfReAuth]);

    return (
        <NavigationContainer>
            <RootStackScreen token={token} allPassed={allPassed} />
        </NavigationContainer>
    );
}
