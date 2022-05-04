import AsyncStorage from '@react-native-community/async-storage';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';

import products from './reducers/productsReducer';
import cart from './reducers/cartReducer';
import orders from './reducers/ordersReducer';
import auth from './reducers/authReducers';

// All reducers
const rootReducer = combineReducers({
    products,
    cart,
    orders,
    auth,
});

// Middleware: Redux Persist Config
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// This will prevent 'several store enhancers' error
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Redux: Store
const store = createStore(persistedReducer, composeEnhancer(applyMiddleware(thunk)));

// Middleware: Redux Persist Persister
const persistor = persistStore(store);

// Exports
export { store, persistor };
