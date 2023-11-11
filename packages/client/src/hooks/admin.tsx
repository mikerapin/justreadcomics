import { useEffect, useState } from 'react';
import { authenticate } from '../data/auth';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    authenticate().then((res) => {
      if (res) {
        setIsAdmin(true);
      }
    });
  });
  return isAdmin;
};
