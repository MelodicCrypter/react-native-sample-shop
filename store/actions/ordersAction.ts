import Order from '../../models/order';

export const fetchOrders = () => {
    return async (dispatch, getState) => {
        const { userId } = getState().auth;
        try {
            const response = await fetch(`https://ezhop-aa90a.firebaseio.com/orders/${userId}.json`);
            const data = await response.json();
            const fetchedOrders: any = [];

            if (!response.ok) throw new Error('Something went wrong!');

            const keys = Object.keys(data);
            keys.forEach((key) => {
                fetchedOrders.push(
                    new Order(key, data[key].items, data[key].totalAmount, data[key].date)
                );
            });

            dispatch({ type: 'SET_ORDERS', payload: fetchedOrders });
        } catch (err) {
            throw err;
        }
    };
};

export const addOrder = (payload) => {
    const { items, totalAmount } = payload;

    return async (dispatch, getState) => {
        const date = new Date();
        const { token, userId } = getState().auth;
        const response = await fetch(
            `https://ezhop-aa90a.firebaseio.com/orders/${userId}.json?auth=${token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    totalAmount,
                    date: date.toISOString(),
                }),
            }
        );

        const data = await response.json();
        const newPayload = { id: data.name, ...payload, date };

        dispatch({ type: 'ADD_ORDER', payload: newPayload });
    };
};
