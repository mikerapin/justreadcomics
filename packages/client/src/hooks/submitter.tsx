import { useEffect, useState } from 'react';
import { authenticate } from '../data/auth';
import { useNavigate } from 'react-router-dom';

export const useSubmitter = () => {
  const [isSubmitter, setIsSubmitter] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    authenticate().then((res) => {
      if (res) {
        setIsSubmitter(true);
      } else {
        navigate('/');
      }
    });
  });
  return isSubmitter;
};
