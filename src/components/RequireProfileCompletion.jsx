
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

const RequireProfileCompletion = ({ children }) => {
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && user && profile) {
            // Check if profile is incomplete
            // We use 'phone_number' and 'region' as key indicators of a complete profile
            // since Google login doesn't provide them.
            // Admin users might not have these, so we skip check for admins.
            if (profile.role !== 'admin' && (!profile.phone_number || !profile.region)) {
                if (location.pathname !== '/complete-profile') {
                    navigate('/complete-profile');
                }
            }
        }
    }, [user, profile, loading, navigate, location.pathname]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    // If profile is incomplete, we don't render children (except if we are already navigating, effectively handled by useEffect)
    // However, to avoid flash of content, we can return null if incomplete
    if (user && profile && profile.role !== 'admin' && (!profile.phone_number || !profile.region)) {
        return null; 
    }

    return children;
};

export default RequireProfileCompletion;
