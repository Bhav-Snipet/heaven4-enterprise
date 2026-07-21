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
    isDeveloperMode: boolean;
    login: (token: string, refreshToken: string, userInfo: UserInfo) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);

    useEffect(() => {
        // Hydrate from localStorage
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_info');
        const devMode = localStorage.getItem('isDeveloperMode') === 'true';
        
        if (storedToken && storedUser) {
            try {
                const parsed = JSON.parse(storedUser) as UserInfo;
                setUser(parsed);
                // If the stored user IS a developer, ensure dev mode is true
                if (parsed.role === 'DEVELOPER' || devMode) {
                    setIsDeveloperMode(true);
                    localStorage.setItem('isDeveloperMode', 'true');
                }
            } catch (e) {
                console.error("Failed to parse user info");
                localStorage.removeItem('user_info');
            }
        }
        setIsLoading(false);

        const handleAuthExpired = () => {
            setUser(null);
        };
        window.addEventListener('auth-expired', handleAuthExpired);
        return () => window.removeEventListener('auth-expired', handleAuthExpired);
    }, []);

    const login = (token: string, refreshToken: string, userInfo: UserInfo) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        
        const currentDevMode = localStorage.getItem('isDeveloperMode') === 'true';
        if (userInfo.role === 'DEVELOPER' || currentDevMode) {
            localStorage.setItem('isDeveloperMode', 'true');
            setIsDeveloperMode(true);
        }
        setUser(userInfo);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('isDeveloperMode');
        setUser(null);
        setIsDeveloperMode(false);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isDeveloperMode, login, logout, isLoading }}>
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
