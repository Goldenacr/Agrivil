
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import FarmersTab from '@/components/admin/FarmersTab';

const AdminFarmersPage = () => {
    const { toast } = useToast();
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'farmer')
            .order('is_verified', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching farmers', description: error.message });
        } else {
            setFarmers(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchData();
        const channel = supabase.channel('admin-farmers-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.farmer' }, () => fetchData(false))
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [fetchData]);

    const handleApiResponse = (error, successMsg, errorMsg, onSuccess) => {
        if (error) {
            toast({ variant: 'destructive', title: errorMsg, description: error.message });
        } else {
            if (successMsg) toast({ title: successMsg });
            if (onSuccess) onSuccess();
        }
    };
    
    const handleVerifyFarmer = async (farmerId) => {
        const { error } = await supabase.from('profiles').update({ is_verified: true, verification_status: 'verified' }).eq('id', farmerId);
        handleApiResponse(error, 'Farmer verified!', 'Failed to verify farmer', () => fetchData(false));
    };

    const handleDeclineFarmer = async (farmerId) => {
         // Use the database function delete_user_data via RPC to ensure all related data is removed
         const { error } = await supabase.rpc('delete_user_data', { target_user_id: farmerId });
         
         // If that fails (e.g. function doesn't exist), try the edge function as fallback (if previously set up)
         if (error) {
             console.error("RPC delete failed, trying edge function...", error);
             const { error: edgeError } = await supabase.functions.invoke('delete-user', { body: { userId: farmerId } });
             handleApiResponse(edgeError, 'Farmer account removed.', 'Failed to remove farmer account.', () => fetchData(false));
         } else {
             handleApiResponse(null, 'Farmer account removed successfully.', 'Failed to remove farmer account.', () => fetchData(false));
         }
    };

    return (
        <>
            <Helmet><title>Manage Farmers - Admin</title></Helmet>
            <div className="py-8">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Manage Farmers</h1>
                {loading ? <p>Loading farmers...</p> : <FarmersTab farmers={farmers} onVerify={handleVerifyFarmer} onDecline={handleDeclineFarmer} />}
            </div>
        </>
    );
};

export default AdminFarmersPage;
