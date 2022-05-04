import produce from 'immer';

import Product from '../../models/product';

export const initialState = {
    availableProducts: [],
    userProducts: [],
    productToEdit: null,
};

function productsReducer(state = initialState, { type, payload }) {
    switch (type) {
        case 'SET_PRODUCTS':
            return produce(state, (draft) => {
                draft.availableProducts = payload.products;
                draft.userProducts = payload.userProducts;
            });
        case 'CREATE_PRODUCT':
            return produce(state, (draft) => {
                const newProduct = new Product(
                    payload.id,
                    payload.ownerId,
                    payload.title,
                    payload.imageUrl,
                    payload.description,
                    payload.price
                );
                draft.availableProducts = [...state.availableProducts, newProduct];
                draft.userProducts = [...state.userProducts, newProduct];
            });
        case 'UPDATE_PRODUCT':
            return produce(state, (draft) => {
                const prodToUpdateIndex = state.userProducts.findIndex(
                    (prod) => prod.id === payload.id
                );
                const updatedProduct = new Product(
                    payload.id,
                    state.userProducts[prodToUpdateIndex].ownerId,
                    payload.title,
                    payload.imageUrl,
                    payload.description,
                    payload.price
                );
                const finalUpdatedUserProducts = [...state.userProducts];
                finalUpdatedUserProducts[prodToUpdateIndex] = updatedProduct;

                // In reality, we would not edit directly all products since
                //  we don't have no access to products that we don't own
                const availableProductsToUpdateIndex = state.availableProducts.findIndex(
                    (prod) => prod.id === payload.id
                );
                const finalUpdatedAvailableProducts = [...state.availableProducts];
                finalUpdatedAvailableProducts[availableProductsToUpdateIndex] = updatedProduct;

                // Save
                draft.availableProducts = finalUpdatedAvailableProducts;
                draft.userProducts = finalUpdatedUserProducts;
            });
        case 'DELETE_PRODUCT':
            return produce(state, (draft) => {
                draft.userProducts = state.userProducts.filter(
                    (product) => product.id !== payload.id
                );
                draft.availableProducts = state.availableProducts.filter(
                    (product) => product.id !== payload.id
                );
            });
        case 'SET_PRODUCT_TO_EDIT':
            return produce(state, (draft) => {
                const productToEdit = state.userProducts.filter((prod) => prod.id === payload.id);
                draft.productToEdit = productToEdit;
            });
        default:
            return state;
    }
}

export default productsReducer;
