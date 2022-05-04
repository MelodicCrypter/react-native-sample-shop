import produce from 'immer';

export const initialState = {
    token: null,
    userId: null,
    refreshToken: null,
};

function authReducers(state = initialState, { type, payload }) {
    switch (type) {
        case 'SIGNUP':
            return produce(state, (draft) => {
                draft.token = payload.token;
                draft.userId = payload.userId;
                draft.refreshToken = payload.refreshToken;
            });
        case 'LOGIN':
            return produce(state, (draft) => {
                draft.token = payload.token;
                draft.userId = payload.userId;
                draft.refreshToken = payload.refreshToken;
            });
        case 'REAUTH_TOKEN':
            return produce(state, (draft) => {
                draft.token = payload.token;
                draft.refreshToken = payload.refreshToken;
            });
        case 'TOKEN_NULLIZE':
            return produce(state, (draft) => {
                draft.token = null;
            });
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}

export default authReducers;
