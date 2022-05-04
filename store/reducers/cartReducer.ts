import produce from 'immer';
import { omit } from 'lodash';

import CartItem from '../../models/cart-item';

export const initialState: { items: {}; totalAmount: number } = {
    items: {},
    totalAmount: 0,
};

function cartReducer(state = initialState, action) {
    switch (action.type) {
        case 'ADD_TO_CART':
            const addedProduct: any = action.payload;
            const prodPrice: number = addedProduct.price;
            const prodTitle: string = addedProduct.title;

            let updatedOrNewCartItem: any;

            if (state.items[addedProduct.id]) {
                // Already added to cart
                updatedOrNewCartItem = new CartItem(
                    state.items[addedProduct.id].quantity + 1,
                    prodPrice,
                    prodTitle,
                    state.items[addedProduct.id].sum + prodPrice
                );
                const finalData = { ...state.items, [addedProduct.id]: updatedOrNewCartItem };
                return produce(state, (draft) => {
                    draft.items = finalData;
                    draft.totalAmount = state.totalAmount + prodPrice;
                });
            } else {
                // New
                const updatedOrNewCartItem = new CartItem(1, prodPrice, prodTitle, prodPrice);
                const finalData = { ...state.items, [addedProduct.id]: updatedOrNewCartItem };
                return produce(state, (draft) => {
                    draft.items = finalData;
                    draft.totalAmount = state.totalAmount + prodPrice;
                });
            }
        case 'REMOVE_FROM_CART':
            const itemToRemoveId = action.payload.id;
            const currentSelectedItem = state.items[itemToRemoveId];

            if (!currentSelectedItem) return state;

            const itemsClone = { ...state.items };
            const updatedCartItem = omit(itemsClone, [itemToRemoveId]);
            // delete itemsClone[itemToRemoveId];

            return produce(state, (draft) => {
                draft.items = updatedCartItem;
                draft.totalAmount = state.totalAmount - currentSelectedItem.sum;
            });
        case 'RESET_CART':
            return initialState;
        default:
            return state;
    }
}

export default cartReducer;
