import { USER_LOGIN, USER_LOGOUT } from '../constants/ActionType';

export const login = (id, name) =>
    ({
        type: USER_LOGIN,
        id,
        name
    });

export const logout = () => 
    ({
        type: USER_LOGOUT
    });
