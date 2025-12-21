
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import countryData from '@/lib/countryData.json';

const ProfileEditDialog = ({ isOpen, onOpenChange, field, currentValue, onSave }) => {
  const { user, profile, fetchProfile } = useAuth();
  const { toast } = useToast();
  const [value, setValue] = useState(currentValue);
  const [loading, setLoading] = useState(false);
  const [phoneDialCode, setPhoneDialCode] = useState('');
  const [phoneBody, setPhoneBody] = useState('');

  useEffect(() => {
    setValue(currentValue || '');
    
    // Specifically handle phone numbers to split dial code if possible
    if (field.type === 'tel' && currentValue) {
        // Attempt to guess dial code from user's country if not explicit in string
        const country = countryData.countries.find(c => c.name === profile?.country);
        const code = country?.dial_code || '';
        
        if (currentValue.startsWith(code)) {
            setPhoneDialCode(code);
            setPhoneBody(currentValue.replace(code, '').trim());
        } else {
            setPhoneDialCode(code);
            setPhoneBody(currentValue);
        }
    } else if (field.type === 'tel') {
        const country = countryData.countries.find(c => c.name === profile?.country);
        setPhoneDialCode(country?.dial_code || '');
    }

  }, [currentValue, isOpen, field.type, profile]);

  const handleSave = async () => {
    setLoading(true);
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      setLoading(false);
      return;
    }

    let valueToSave = value;
    if (field.type === 'tel') {
        valueToSave = `${phoneDialCode} ${phoneBody}`.trim();
    }

    const { error } = await supabase
      .from('profiles')
      .update({ [field.name]: valueToSave })
      .eq('id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
    } else {
      toast({ title: 'Profile updated!' });
      await fetchProfile(user.id);
      onOpenChange(false);
    }
    setLoading(false);
  };

  const renderField = () => {
    switch (field.type) {
      case 'tel':
          return (
            <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm min-w-[3.5rem] justify-center">
                    {phoneDialCode || '+?'}
                </span>
                <Input 
                    id={field.name} 
                    type="tel" 
                    className="rounded-l-none"
                    value={phoneBody} 
                    onChange={(e) => setPhoneBody(e.target.value)} 
                    placeholder="123456789"
                />
            </div>
          );
      case 'text':
      case 'date':
        return <Input id={field.name} type={field.type} value={value} onChange={(e) => setValue(e.target.value)} />;
      case 'select':
        return (
          <Select onValueChange={setValue} value={value}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {field.label}</DialogTitle>
          <DialogDescription>
            Update your {field.label.toLowerCase()} here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={field.name} className="text-right">
              {field.label}
            </Label>
            <div className="col-span-3">{renderField()}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
