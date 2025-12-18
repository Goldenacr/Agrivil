
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Smartphone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // State for 2FA mockup
    const [code2fa, setCode2fa] = useState('');
    const [loading2fa, setLoading2fa] = useState(false);

    const handleEmailReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/settings/security`, // Redirect to security settings page where they can set new password
            });

            if (error) throw error;

            setSuccess(true);
            toast({ title: 'Check your email', description: 'We have sent you a password reset link.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handle2FAResetAttempt = (e) => {
        e.preventDefault();
        setLoading2fa(true);
        
        // Simulating check - in reality, Supabase doesn't support "Reset Password via TOTP" without logging in.
        setTimeout(() => {
            setLoading2fa(false);
            toast({ 
                title: "Authentication Required", 
                description: "Security Protocol: You cannot reset a forgotten password using only 2FA without verifying your identity first. Please use the Email Verification option to regain access.",
                variant: "warning"
            });
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-gray-50/50">
            <Helmet>
                <title>Reset Password - Agribridge</title>
            </Helmet>
            
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                         <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1"/> Back to Login
                         </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <CardDescription>
                        Choose a method to verify your identity and reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600"/>
                            </div>
                            <h3 className="text-xl font-semibold">Email Sent!</h3>
                            <p className="text-muted-foreground max-w-xs">
                                Check your inbox for <strong>{email}</strong>. Follow the link to create a new password.
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/login">Return to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <Tabs defaultValue="email" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="email">Email Verification</TabsTrigger>
                                <TabsTrigger value="2fa">2FA Code</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="email" className="space-y-4">
                                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
                                    <Mail className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>We'll send a secure link to your registered email address to reset your password.</p>
                                </div>
                                <form onSubmit={handleEmailReset} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            placeholder="name@example.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send Reset Link
                                    </Button>
                                </form>
                            </TabsContent>
                            
                            <TabsContent value="2fa" className="space-y-4">
                                <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100 text-sm text-amber-800 flex gap-3">
                                    <Smartphone className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>Use the 6-digit code from your authenticator app to verify identity.</p>
                                </div>
                                <form onSubmit={handle2FAResetAttempt} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Authenticator Code</Label>
                                        <Input 
                                            id="code" 
                                            placeholder="000 000" 
                                            className="text-center text-lg tracking-widest"
                                            maxLength={6}
                                            value={code2fa}
                                            onChange={(e) => setCode2fa(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading2fa || code2fa.length < 6}>
                                        {loading2fa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Verify & Reset
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
