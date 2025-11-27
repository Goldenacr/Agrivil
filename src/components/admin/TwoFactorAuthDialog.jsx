
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"


export const TwoFactorAuthDialog = ({ isOpen, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [step, setStep] = useState('initial'); // 'initial', 'qr', 'verify'
  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const startEnrollment = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to start 2FA setup', description: error.message });
      return;
    }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
    setStep('qr');
  };
  
  const verifyCode = async () => {
    setLoading(true);
    const { error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if(challengeError) {
        toast({ variant: 'destructive', title: 'Challenge failed', description: challengeError.message });
        setLoading(false);
        return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, code: verificationCode });
    setLoading(false);
    if (verifyError) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: 'The code is incorrect. Please try again.' });
    } else {
      toast({ title: '2FA Enabled!', description: 'Two-Factor Authentication is now active.' });
      onSuccess();
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    setStep('initial');
    setQrCode('');
    setFactorId('');
    setVerificationCode('');
    setLoading(false);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };
  
  const renderContent = () => {
    switch (step) {
      case 'qr':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Step 1: Scan QR Code</DialogTitle>
              <DialogDescription>Scan this QR code with your authenticator app (e.g., Google Authenticator).</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              {qrCode ? (
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48"/>
              ) : <Loader2 className="w-12 h-12 animate-spin" />}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep('initial')}>Back</Button>
                <Button onClick={() => setStep('verify')}>Next</Button>
            </DialogFooter>
          </>
        );
      case 'verify':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Step 2: Verify Code</DialogTitle>
              <DialogDescription>Enter the 6-digit code from your authenticator app to complete the setup.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
                <KeyRound className="w-12 h-12 text-primary mb-2" />
                <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep('qr')}>Back</Button>
                <Button onClick={verifyCode} disabled={loading || verificationCode.length < 6}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    Verify & Enable
                </Button>
            </DialogFooter>
          </>
        );
      default: // initial
        return (
          <>
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>Add an extra layer of security to your account. You will need an authenticator app to continue.</DialogDescription>
            </DialogHeader>
            <div className="text-center p-8">
                <ShieldCheck className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={startEnrollment} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Begin Setup
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
