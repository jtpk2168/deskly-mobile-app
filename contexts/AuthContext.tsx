import React, { createContext, useContext, useEffect, useState } from 'react';
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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkUserRole(session?.user);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkUserRole(session?.user);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkUserRole = (user: User | undefined | null) => {
        if (user?.app_metadata?.role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
