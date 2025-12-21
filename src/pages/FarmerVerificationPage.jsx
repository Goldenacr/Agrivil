
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Upload, FileCheck, ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const FarmerVerificationPage = () => {
    const { user, profile, fetchProfile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [idFrontFile, setIdFrontFile] = useState(null);
    const [idBackFile, setIdBackFile] = useState(null);

    // Check status on mount
    useEffect(() => {
        if(profile && profile.role !== 'farmer') {
            navigate('/');
        }
    }, [profile, navigate]);

    const handleFileUpload = async (file, bucketName, path) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}-${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from(bucketName).upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!idFrontFile || !idBackFile) {
            toast({ variant: 'destructive', title: 'Missing Documents', description: 'Please upload both front and back of your ID card.' });
            return;
        }

        setLoading(true);
        try {
            // Using 'product_images' as a bucket for simplicity (assuming it exists and is public/authenticated)
            const frontUrl = await handleFileUpload(idFrontFile, 'product_images', `verification/${user.id}/id_front`);
            const backUrl = await handleFileUpload(idBackFile, 'product_images', `verification/${user.id}/id_back`);
            
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    is_verified: false, 
                    verification_status: 'under_review',
                    id_card_front_url: frontUrl,
                    id_card_back_url: backUrl
                })
                .eq('id', user.id);

            if (error) throw error;
            
            await fetchProfile(user.id); // Refresh profile context
            toast({ title: 'Documents Submitted', description: 'Your verification request is now under review.' });

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    // View for "Under Review" state - UPDATED MESSAGE HERE
    if (profile?.verification_status === 'under_review') {
        return (
             <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-12 h-12 text-blue-600" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900">Application Under Review</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-lg mx-auto">
                    <p className="text-lg text-blue-900 font-medium mb-2">
                        Your documents are under review.
                    </p>
                    <p className="text-gray-600">
                        We will notify you by email or WhatsApp when your documents are approved or declined.
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/farmer-dashboard')}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-12">
            <Helmet>
                <title>Farmer Verification - Agribridge</title>
            </Helmet>
            
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Verify Your Farmer Account</h1>
                <p className="text-muted-foreground">Upload your identification documents to start selling.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/> Identity Verification</CardTitle>
                    <CardDescription>Please provide clear photos of your National ID card.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label className="mb-2 block font-semibold">National ID (Front) *</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer">
                                <ImageUpload imageFile={idFrontFile} onFileChange={setIdFrontFile} />
                                <p className="text-xs text-muted-foreground mt-2">Accepted formats: JPG, PNG</p>
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block font-semibold">National ID (Back) *</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer">
                                <ImageUpload imageFile={idBackFile} onFileChange={setIdBackFile} />
                                <p className="text-xs text-muted-foreground mt-2">Accepted formats: JPG, PNG</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
                    <Button variant="ghost" onClick={() => navigate('/farmer-dashboard')}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !idFrontFile || !idBackFile} className="bg-primary">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit for Verification
                    </Button>
                </CardFooter>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-sm">1. Upload ID</h3>
                    <p className="text-xs text-muted-foreground mt-1">Front and back photos.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Loader2 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-sm">2. Admin Review</h3>
                    <p className="text-xs text-muted-foreground mt-1">We verify your details.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-sm">3. Approved</h3>
                    <p className="text-xs text-muted-foreground mt-1">Start selling immediately!</p>
                </div>
            </div>
        </div>
    );
};

export default FarmerVerificationPage;
