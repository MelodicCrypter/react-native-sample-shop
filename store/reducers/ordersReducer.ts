import produce from 'immer';

import Order from '../../models/order';

export const initialState: { orders: Array<any> } = {
    orders: [],
};

function ordersReducer(state = initialState, { type, payload }) {
    switch (type) {
        case 'SET_ORDER':
            return produce(state, (draft) => {
                draft.orders = payload;
            });
        case 'ADD_ORDER':
            const newOrder = new Order(
                payload.id,
                payload.items,
                payload.totalAmount,
                payload.date
            );

            return produce(state, (draft) => {
                draft.orders = [...state.orders, newOrder];
            });
        default:
            return state;
    }
}

export default ordersReducer;
