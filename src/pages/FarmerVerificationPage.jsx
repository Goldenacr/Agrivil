
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Upload, FileCheck, ShieldCheck, CheckCircle } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const FarmerVerificationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [idCardFile, setIdCardFile] = useState(null);
    const [businessCertFile, setBusinessCertFile] = useState(null);

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
        
        if (!idCardFile) {
            toast({ variant: 'destructive', title: 'Missing ID Card', description: 'Please upload a valid National ID card.' });
            return;
        }

        setLoading(true);
        try {
            // Using 'product_images' as a fallback public bucket if specific ones aren't set up
            const idCardUrl = await handleFileUpload(idCardFile, 'product_images', `verification/${user.id}/id_card`);
            const certUrl = await handleFileUpload(businessCertFile, 'product_images', `verification/${user.id}/business_cert`);
            
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    is_verified: false, 
                    business_registration_status: 'pending_verification' 
                })
                .eq('id', user.id);

            if (error) throw error;
            
            setSuccess(true);
            toast({ title: 'Documents Submitted', description: 'Your verification request is under review.' });
            
            setTimeout(() => {
                navigate('/farmer-dashboard');
            }, 3000);

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900">Submission Received!</h2>
                <p className="text-lg text-gray-600 max-w-md">
                    Thank you for submitting your documents. Our team will review your information and verify your account within 24-48 hours.
                </p>
                <Button onClick={() => navigate('/farmer-dashboard')}>Return to Dashboard</Button>
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
                <p className="text-muted-foreground">Upload the required documents to start selling on Agribridge.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/> Identity Verification</CardTitle>
                    <CardDescription>We need to verify your identity to ensure a safe marketplace for everyone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block font-semibold">National ID Card (Front & Back) *</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer">
                                <ImageUpload imageFile={idCardFile} onFileChange={setIdCardFile} />
                                <p className="text-xs text-muted-foreground mt-2">Accepted formats: JPG, PNG, PDF</p>
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block font-semibold">Business Registration Certificate (Optional)</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer">
                                <ImageUpload imageFile={businessCertFile} onFileChange={setBusinessCertFile} />
                                <p className="text-xs text-muted-foreground mt-2">If you have a registered business, uploading this increases trust.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
                    <Button variant="ghost" onClick={() => navigate('/farmer-dashboard')}>Skip for Now</Button>
                    <Button onClick={handleSubmit} disabled={loading || !idCardFile} className="bg-primary">
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
                    <h3 className="font-semibold text-sm">1. Upload</h3>
                    <p className="text-xs text-muted-foreground mt-1">Submit your documents securely.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Loader2 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-sm">2. Review</h3>
                    <p className="text-xs text-muted-foreground mt-1">Admin reviews within 48 hours.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-sm">3. Approved</h3>
                    <p className="text-xs text-muted-foreground mt-1">Start selling with a verified badge!</p>
                </div>
            </div>
        </div>
    );
};

export default FarmerVerificationPage;
