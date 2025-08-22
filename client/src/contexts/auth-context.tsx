import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, SignupCredentials } from '@/types/auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [storedUser, setStoredUser] = useLocalStorage('user', null);
  const [storedUserId, setStoredUserId] = useLocalStorage('userId', 'guest');
  const { toast } = useToast();

  // Check for stored user on mount
  useEffect(() => {
    if (storedUser && storedUserId !== 'guest') {
      dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
    } else {
      dispatch({ type: 'AUTH_FAILURE', payload: '' });
    }
  }, [storedUser, storedUserId]);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await apiRequest('POST', '/api/auth/login', credentials);
      
      if (response.user) {
        // Store user data
        setStoredUser(response.user);
        setStoredUserId(response.user.id);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        
        toast({
          title: 'Welcome back!',
          description: `Hello, ${response.user.username}!`,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await apiRequest('POST', '/api/auth/signup', credentials);
      
      if (response.user) {
        // Store user data
        setStoredUser(response.user);
        setStoredUserId(response.user.id);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        
        toast({
          title: 'Account created!',
          description: `Welcome to MusicFlow, ${response.user.username}!`,
        });
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      
      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const logout = () => {
    // Clear stored data
    setStoredUser(null);
    setStoredUserId('guest');
    
    dispatch({ type: 'LOGOUT' });
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 