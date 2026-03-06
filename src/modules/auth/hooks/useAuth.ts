import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthService } from '../services';

export const useLogin = () => {
  return useMutation({
    mutationFn: AuthService.login,
  });
};

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: AuthService.getSession,
  });
};
