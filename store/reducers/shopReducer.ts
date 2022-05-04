import produce from 'immer';

export const initialState = {
    testState: false,
};

function shopReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_TEST_STATE':
            return produce(state, (draft) => {
                draft.testState = action.payload.testState;
            });
        default:
            return state;
    }
}

export default shopReducer;
