
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Shield, KeyRound, Smartphone, AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { TwoFactorAuthDialog } from '@/components/settings/TwoFactorAuthDialog';

const SecuritySettingsPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    
    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 2FA State
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [loading2FAStatus, setLoading2FAStatus] = useState(true);

    const fetch2FAStatus = useCallback(async () => {
        setLoading2FAStatus(true);
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (!error && data.totp && data.totp.length > 0) {
            const hasVerifiedFactor = data.totp.some(factor => factor.status === 'verified');
            setIs2FAEnabled(hasVerifiedFactor);
        } else {
            setIs2FAEnabled(false);
        }
        setLoading2FAStatus(false);
    }, []);

    useEffect(() => {
        fetch2FAStatus();
    }, [fetch2FAStatus]);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Password is too short', description: 'Please use at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match' });
            return;
        }

        setPasswordLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            toast({ variant: 'destructive', title: 'Failed to reset password', description: error.message });
        } else {
            toast({ title: 'Password updated successfully!' });
            setNewPassword('');
            setConfirmPassword('');
        }
        setPasswordLoading(false);
    };

    const handle2FAToggle = () => {
        if (!is2FAEnabled) {
            setShow2FADialog(true);
        } else {
            const unenroll = async () => {
                const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
                if (listError || !factors.totp || factors.totp.length === 0) {
                    toast({variant: 'destructive', title: 'Error', description: 'No 2FA factor found to disable.'});
                    return;
                }
                
                let hasError = false;
                for (const factor of factors.totp) {
                    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
                    if (error) hasError = true;
                }
                
                if (hasError) {
                    toast({variant: 'destructive', title: 'Failed to disable 2FA', description: 'Could not unenroll all factors.'});
                } else {
                    toast({title: 'Two-Factor Authentication has been disabled.'});
                    setIs2FAEnabled(false);
                }
            };
            unenroll();
        }
    };

    return (
        <>
            <Helmet>
                <title>Security Settings - Agribridge</title>
            </Helmet>
            <div className="bg-gray-50 min-h-screen pb-20">
                <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-12 animate-in fade-in duration-500">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                             <Link to="/settings" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Settings
                             </Link>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Security Settings</h1>
                            <p className="text-gray-500 max-w-lg">Manage your password and secure your account with two-factor authentication.</p>
                        </div>
                        <Button asChild variant="outline" className="shadow-sm border-gray-300 bg-white hover:bg-gray-50 shrink-0">
                            <Link to="/" className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                    
                    <div className="space-y-10">
                        {/* Password Section */}
                        <section aria-labelledby="password-heading">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <KeyRound className="w-6 h-6 text-blue-600"/>
                                </div>
                                <div>
                                    <h3 id="password-heading" className="text-xl font-semibold text-gray-900">Password</h3>
                                    <p className="text-sm text-gray-500">Change your password regularly to keep your account safe.</p>
                                </div>
                            </div>

                            <Card className="border-0 shadow-md ring-1 ring-gray-200">
                                <CardContent className="p-6 md:p-8">
                                     <form onSubmit={handlePasswordReset} className="space-y-6 max-w-xl">
                                        <div className="space-y-2">
                                            <Label htmlFor="account">Account Email</Label>
                                            <Input id="account" value={user?.email || ''} disabled className="bg-gray-100 text-gray-500 border-gray-200" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="relative space-y-2">
                                                <Label htmlFor="new-password">New Password</Label>
                                                <Input
                                                    id="new-password"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Min. 6 characters"
                                                    required
                                                    disabled={passwordLoading}
                                                    className="pr-10"
                                                />
                                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-[2.4rem] text-gray-400 hover:text-gray-600">
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <div className="relative space-y-2">
                                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                                <Input
                                                    id="confirm-password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    required
                                                    disabled={passwordLoading}
                                                    className="pr-10"
                                                />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[2.4rem] text-gray-400 hover:text-gray-600">
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <Button type="submit" disabled={passwordLoading} className="w-full md:w-auto min-w-[150px]">
                                                {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Update Password
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </section>
                        
                        {/* 2FA Section */}
                        <section aria-labelledby="2fa-heading">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Shield className="w-6 h-6 text-green-600"/>
                                </div>
                                <div>
                                    <h3 id="2fa-heading" className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                                </div>
                            </div>

                            <Card className="border-0 shadow-md ring-1 ring-gray-200">
                                <CardContent className="p-6 md:p-8 space-y-8">
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-full shadow-sm border mt-1">
                                                <Smartphone className="w-5 h-5 text-gray-600"/>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="font-semibold text-gray-900 block">Authenticator App</span>
                                                <span className="text-sm text-gray-500 block max-w-md">Use apps like Google Authenticator or Authy to generate time-based verification codes.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-medium ${is2FAEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                                {is2FAEnabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                            {loading2FAStatus ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : <Switch id="mfa-toggle" checked={is2FAEnabled} onCheckedChange={handle2FAToggle} />}
                                        </div>
                                    </div>
                                    
                                    {!is2FAEnabled && (
                                        <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-amber-800">Why enable 2FA?</h4>
                                                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                                                    Enabling Two-Factor Authentication significantly reduces the risk of unauthorized access. It is highly recommended for all users.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    <TwoFactorAuthDialog 
                        isOpen={show2FADialog} 
                        onOpenChange={setShow2FADialog}
                        onSuccess={() => {
                            setShow2FADialog(false);
                            fetch2FAStatus();
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default SecuritySettingsPage;
