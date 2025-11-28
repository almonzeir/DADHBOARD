import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    checkAdminAccess: (userId: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    checkAdminAccess: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user has admin access (is approved in admin_users table)
    const checkAdminAccess = async (userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('is_approved')
                .eq('id', userId)
                .single();

            if (error || !data) {
                return false;
            }

            return data.is_approved === true;
        } catch (error) {
            console.error('Error checking admin access:', error);
            return false;
        }
    };

    useEffect(() => {
        let isSigningOut = false; // Flag to prevent infinite loops

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                // Check if user has admin access
                const hasAccess = await checkAdminAccess(session.user.id);
                if (!hasAccess) {
                    // User doesn't have admin access, sign them out
                    if (!isSigningOut) {
                        isSigningOut = true;
                        await supabase.auth.signOut();
                    }
                    setSession(null);
                    setUser(null);
                } else {
                    setSession(session);
                    setUser(session.user);
                }
            } else {
                setSession(null);
                setUser(null);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);

            // Skip processing if we're in the middle of signing out
            if (event === 'SIGNED_OUT' || isSigningOut) {
                setSession(null);
                setUser(null);
                setLoading(false);
                isSigningOut = false; // Reset flag
                return;
            }

            if (session?.user) {
                // Check if user has admin access
                const hasAccess = await checkAdminAccess(session.user.id);
                if (!hasAccess) {
                    // User doesn't have admin access, sign them out
                    if (!isSigningOut) {
                        isSigningOut = true;
                        await supabase.auth.signOut();
                    }
                    setSession(null);
                    setUser(null);
                } else {
                    setSession(session);
                    setUser(session.user);
                }
            } else {
                setSession(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, checkAdminAccess }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
