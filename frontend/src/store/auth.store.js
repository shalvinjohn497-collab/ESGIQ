
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: true,
      token: 'demo-token',
      user: {
        name: 'Dr. Priya Nair',
        orgName: 'Sunrise Multispecialty Hospital',
        sector: 'HOSP',
      },
      login: (token, user) => set({ isAuthenticated: true, token, user }),
      logout: () => set({ isAuthenticated: false, token: null, user: null }),
      setUser: (user) => set({ user }),
      setSector: (sector) => set((s) => ({ user: { ...s.user, sector } })),
    }),
    { name: 'auth-storage' }
  )
);

export default useAuthStore;