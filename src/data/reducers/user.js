import { Reducer } from 'redux';

import { edxProvider } from '../../auth/providers/edx';
import { AuthService } from '../../auth/service';
import { USER_LOGIN, USER_LOGOUT } from '../constants/ActionType';

const unauthenticatedState = {
    isLoggedIn: false,
    id: null,
    name: null
};

const initialState = { ...unauthenticatedState };

const session = AuthService.restoreSession(edxProvider);
if (session) {
    initialState.isLoggedIn = true;
    //initialState.id = session.decodedIdToken.oid;
    //initialState.name = session.decodedIdToken.name;
    initialState.id = 'douglas_hall';
    initialState.name = 'Douglas Hall';
}

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case USER_LOGIN:
            return {
                ...state,
                isLoggedIn: true,
                name: action.name
            };
        case USER_LOGOUT:
            AuthService.invalidateSession();
            return { ...unauthenticatedState };
        default:
            return state;
    };
}

export default userReducer;
