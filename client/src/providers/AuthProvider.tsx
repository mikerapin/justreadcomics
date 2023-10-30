import { createContext, ReactElement, useContext, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLocalStorage } from './useLocalStorage';

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
  const [user, setUser] = useLocalStorage('token', userToken || '');
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = async (userToken: string) => {
    setUser(userToken);
    navigate('/admin');
  };

  // call this function to sign out logged-in user
  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
