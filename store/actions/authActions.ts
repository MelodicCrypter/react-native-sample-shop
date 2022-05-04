const API_KEY = 'AIzaSyCs3iUIjCJzEvsKdYC_AZMy4yigkL3oiQE';

export const signUp = (payload) => {
    const { email, password } = payload;

    return async (dispatch) => {
        try {
            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        returnSecureToken: true,
                    }),
                }
            );

            if (!response.ok) throw new Error('Something went wrong!');
            const data = await response.json();
        } catch (err) {
            throw err;
        }
    };
};

export const signIn = (payload) => {
    const { email, password } = payload;

    return async (dispatch) => {
        try {
            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        returnSecureToken: true,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg = errorData.error.message;
                let finalMsg = 'Something went wrong!';

                if (errorMsg === 'EMAIL_NOT_FOUND') {
                    finalMsg = 'Please check your Email or Passowrd';
                }

                throw new Error(finalMsg);
            }

            const data = await response.json();
            const newPayload = {
                token: data.idToken,
                userId: data.localId,
                refreshToken: data.refreshToken,
            };
            dispatch({ type: 'SIGNIN', payload: newPayload });
        } catch (err) {
            throw err;
        }
    };
};

export const reAuthToken = (payload) => {
    const { token } = payload;

    return async (dispatch) => {
        try {
            const response = await fetch(
                `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'aplication/x-www-form-urlencoded' },
                    body: JSON.stringify({
                        grant_type: 'refresh_token',
                        refresh_token: token,
                    }),
                }
            );

            if (!response.ok) throw new Error('ReAuth: Error!');

            const data = await response.json();
            const newPayload = {
                token: data.id_token,
                refreshToken: data.refresh_token,
            };
            dispatch({ type: 'REAUTH_TOKEN', payload: newPayload });
        } catch (err) {
            throw err;
        }
    };
};

export const tokenNullize = () => {
    return { type: 'TOKEN_NULLIZE' };
};

export const logout = () => {
    return { type: 'LOGOUT' };
};
