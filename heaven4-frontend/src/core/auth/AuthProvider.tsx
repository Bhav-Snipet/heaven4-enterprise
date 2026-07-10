import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserInfo {
    id: number;
    displayName: string;
    role: string;
    workspace: string;
}

interface AuthContextType {
    user: UserInfo | null;
    isAuthenticated: boolean;
    login: (token: string, refreshToken: string, userInfo: UserInfo) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_info');
        
        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user info");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, refreshToken: string, userInfo: UserInfo) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        setUser(userInfo);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
