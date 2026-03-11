import { useState } from 'react';

export default function useAuth() {
  const [user, setUser] = useState(null);

  const saveToken = (token: string) => {
    localStorage.setItem('token', token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, setUser, saveToken, logout };
}
