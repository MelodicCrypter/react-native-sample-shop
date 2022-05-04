import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as AuthActions from '../../store/actions/authActions';

export default function LogoutScreen() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(AuthActions.tokenNullize());
    }, []);

    return <></>;
}
