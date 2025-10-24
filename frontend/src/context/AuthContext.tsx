// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types';
import { GetCurrentUser, LoginUser, LogoutUser, RegisterUser } from '../utils/auth';

/**
 * Defines the shape of the authentication context.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: typeof LoginUser;
  logout: typeof LogoutUser;
  register: typeof RegisterUser;
}

/**
 * The authentication context.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access the authentication context.
 *
 * @returns {AuthContextType} The authentication context.
 * @throws {Error} If used outside of an `AuthProvider`.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Provides the authentication context to its children.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the current user on initial load.
   */
  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await GetCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError('Failed to fetch user.');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  /**
   * Logs in a user.
   *
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<User>} The logged-in user.
   */
  const login: typeof LoginUser = async (email, password) => {
    try {
      const loggedInUser = await LoginUser(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError('Invalid credentials.');
      throw err;
    }
  };

  /**
   * Logs out the current user.
   */
  const logout: typeof LogoutUser = async () => {
    try {
      await LogoutUser();
      setUser(null);
    } catch (err) {
      setError('Failed to logout.');
      throw err;
    }
  };

  /**
   * Registers a new user.
   *
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @param {string} first_name - The user's first name.
   * @param {string} last_name - The user's last name.
   * @param {string} bio - The user's bio.
   * @param {string | Date} dob - The user's date of birth.
   * @param {boolean} is_institution_staff - Whether the user is institution staff.
   * @returns {Promise<User>} The registered user.
   */
  const register: typeof RegisterUser = async (
    email,
    password,
    first_name,
    last_name,
    bio,
    dob,
    is_institution_staff
  ) => {
    try {
      const registeredUser = await RegisterUser(
        email,
        password,
        first_name,
        last_name,
        bio,
        dob,
        is_institution_staff
      );
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError('Registration failed.');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
