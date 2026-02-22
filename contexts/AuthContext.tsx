import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    isLoading: true,
    isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const applySession = useCallback((nextSession: Session | null) => {
        const nextUser = nextSession?.user ?? null;
        setSession(nextSession);
        setUser(nextUser);
        setIsAdmin(nextUser?.app_metadata?.role === 'admin');
        setIsLoading(false);
    }, []);

    useEffect(() => {
        let mounted = true;

        const applyIfMounted = (nextSession: Session | null) => {
            if (!mounted) return;
            applySession(nextSession);
        };

        void supabase.auth.getSession()
            .then(({ data: { session: nextSession } }) => {
                applyIfMounted(nextSession);
            })
            .catch(() => {
                if (mounted) setIsLoading(false);
            });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            applyIfMounted(nextSession);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [applySession]);

    return (
        <AuthContext.Provider value={{ session, user, isLoading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
