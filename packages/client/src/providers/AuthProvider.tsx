import { createContext, ReactElement, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from './useLocalStorage';
import { USER_TOKEN_LOCAL_STORAGE_ID } from '../static/const';

interface IAuthContext {
  user: null;
  logout: () => void;
  login: (userToken: string) => void;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  logout: () => {},
  login: (userToken: string) => {}
});

export const AuthProvider = ({ children, userToken }: { children: ReactElement | ReactElement[]; userToken: string | null }) => {
  const [user, setUser] = useLocalStorage(USER_TOKEN_LOCAL_STORAGE_ID, userToken || '');
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  // this is nice but our login component lives outside of this context so... kinda unnecessary
  const login = async (userToken: string) => {
    setUser(userToken);
  };

  // call this function to sign out logged-in user
  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(USER_TOKEN_LOCAL_STORAGE_ID);
    navigate('/', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout
    }),
    // eslint-disable-next-line
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
