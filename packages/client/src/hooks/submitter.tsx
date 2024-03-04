import { useEffect, useState } from 'react';
import { authenticate } from '../data/auth';

export const useSubmitter = () => {
  const [isSubmitter, setIsSubmitter] = useState(false);
  useEffect(() => {
    authenticate().then((res) => {
      if (res) {
        setIsSubmitter(true);
      }
    });
  });
  return isSubmitter;
};
