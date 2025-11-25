
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Mail, Phone, MapPin, Shield, User, ShoppingBag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminUserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id]);

    if (loading) {
        return <div className="p-8 flex justify-center text-muted-foreground">Loading user details...</div>;
    }

    if (!profile) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">User not found</h2>
                <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start py-3 border-b last:border-0">
            <div className="w-8 mt-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-base text-gray-900 mt-1 font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Users
                </Button>
                <h1 className="text-2xl font-bold">User Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Profile Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                             <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-lg">
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback className="text-2xl">{profile.full_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-xl break-words">{profile.full_name}</CardTitle>
                        <div className="mt-2">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
                                profile.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                profile.role === 'farmer' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {profile.role}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                             <Shield className="h-4 w-4" />
                             Status: {profile.banned_until ? 'Suspended' : 'Active'}
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Registration Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg mb-4 text-primary">Personal & Contact</h3>
                            <InfoRow icon={User} label="Full Name" value={profile.full_name} />
                            <InfoRow icon={Mail} label="Email Address" value={profile.email} />
                            <InfoRow icon={Phone} label="Phone Number" value={profile.phone_number} />
                            <InfoRow icon={MapPin} label="Country" value={profile.country} />
                            <InfoRow icon={User} label="Gender" value={profile.gender} />
                            <InfoRow icon={Calendar} label="Date of Birth" value={profile.date_of_birth} />
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg mb-4 text-primary mt-4">Location & Delivery</h3>
                            <InfoRow icon={MapPin} label="Region" value={profile.region} />
                            <InfoRow icon={MapPin} label="City/Town" value={profile.city_town} />
                            <InfoRow icon={MapPin} label="Nearest Landmark" value={profile.nearest_landmark} />
                            <InfoRow icon={MapPin} label="Delivery Address" value={profile.delivery_address} />
                            <InfoRow icon={ShoppingBag} label="Preferred Delivery Method" value={profile.preferred_delivery_method} />
                            {profile.preferred_hub && <InfoRow icon={MapPin} label="Preferred Hub" value={profile.preferred_hub} />}
                        </div>

                        {profile.role === 'farmer' && (
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg mb-4 text-primary mt-4">Farmer Details</h3>
                                <InfoRow icon={Shield} label="National ID" value={profile.national_id} />
                                <InfoRow icon={MapPin} label="Farm Location (GPS)" value={profile.gps_location} />
                                <InfoRow icon={MapPin} label="Farm Address" value={profile.farm_address} />
                                <InfoRow icon={ShoppingBag} label="Farm Type" value={profile.farm_type} />
                                <InfoRow icon={ShoppingBag} label="Farm Size" value={`${profile.farm_size} Acres`} />
                                <InfoRow icon={ShoppingBag} label="Main Products" value={profile.main_products} />
                                <InfoRow icon={Calendar} label="Experience" value={`${profile.farming_experience} Years`} />
                                <InfoRow icon={Shield} label="Business Reg. Status" value={profile.business_registration_status} />
                                <InfoRow icon={Shield} label="FDA Cert. Status" value={profile.fda_certification_status} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminUserDetailsPage;
                          
