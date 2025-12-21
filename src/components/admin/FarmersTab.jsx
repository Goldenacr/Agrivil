
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldOff, Eye, XCircle, CheckCircle, FileText } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FarmersTab = ({ farmers, onVerify, onDecline }) => {
    const { toast } = useToast();
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
    const [farmerToDecline, setFarmerToDecline] = useState(null);

    const handleDeclineClick = (farmer) => {
        setFarmerToDecline(farmer);
        setShowDeclineConfirm(true);
    };

    const confirmDecline = async () => {
        if (!farmerToDecline) return;

        // 1. Attempt to delete files. If this fails, we LOG it but continue to delete user.
        try {
            const folderPath = `verification/${farmerToDecline.id}`;
            const { data: files, error: listError } = await supabase.storage.from('product_images').list(folderPath);
            
            if (files && files.length > 0) {
                 const filesToRemove = files.map(file => `${folderPath}/${file.name}`);
                 const { error: removeError } = await supabase.storage.from('product_images').remove(filesToRemove);
                 if (removeError) console.error("Error removing files (non-blocking):", removeError);
            }
        } catch (error) {
             console.error("Error during file cleanup (non-blocking):", error);
        }

        // 2. Delete user via parent callback. This is the critical step.
        try {
             if (onDecline) {
                await onDecline(farmerToDecline.id);
            } else {
                toast({ variant: 'destructive', title: 'Configuration Error', description: 'Decline function not provided.' });
            }
        } catch (error) {
             console.error("Error deleting farmer:", error);
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete farmer account.' });
        } finally {
            setShowDeclineConfirm(false);
            setFarmerToDecline(null);
            setSelectedFarmer(null);
        }
    };

    return (
        <>
            <h3 className="text-xl font-semibold mb-4">Farmer Verification</h3>
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left font-medium text-muted-foreground">Name</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Contact</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Verification Status</th>
                                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {farmers.map((farmer, index) => (
                                <motion.tr 
                                    key={farmer.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white hover:bg-gray-50/50"
                                >
                                    <td className="p-3 font-medium">
                                        {farmer.full_name || 'N/A'}
                                        <div className="text-xs text-muted-foreground">{farmer.email}</div>
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {farmer.phone_number || 'N/A'}
                                        <div className="text-xs">{farmer.country}</div>
                                    </td>
                                    <td className="p-3">
                                        {farmer.is_verified ? (
                                            <span className="inline-flex items-center text-green-600 font-medium text-xs px-2 py-1 bg-green-50 rounded-full border border-green-200">
                                                <ShieldCheck className="h-3 w-3 mr-1.5" /> Verified
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center font-medium text-xs px-2 py-1 rounded-full border ${
                                                farmer.verification_status === 'under_review' 
                                                ? 'text-blue-600 bg-blue-50 border-blue-200' 
                                                : 'text-orange-600 bg-orange-50 border-orange-200'
                                            }`}>
                                                <ShieldOff className="h-3 w-3 mr-1.5" /> 
                                                {farmer.verification_status === 'under_review' ? 'Under Review' : 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedFarmer(farmer)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Review
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {farmers.length === 0 && <p className="text-center text-muted-foreground py-8">No farmers found.</p>}

            <Dialog open={!!selectedFarmer} onOpenChange={(open) => !open && setSelectedFarmer(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Farmer Application</DialogTitle>
                        <DialogDescription>Verify the farmer's details against their uploaded documents.</DialogDescription>
                    </DialogHeader>
                    
                    {selectedFarmer && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Full Name</h4>
                                    <p>{selectedFarmer.full_name}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Email</h4>
                                    <p>{selectedFarmer.email}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Phone</h4>
                                    <p>{selectedFarmer.phone_number}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Country</h4>
                                    <p>{selectedFarmer.country}</p>
                                </div>
                                <div className="col-span-2 border-t pt-3 mt-1">
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-700">
                                                {selectedFarmer.document_type || "National ID"}
                                            </h4>
                                            <p className="font-mono text-lg tracking-wide">{selectedFarmer.national_id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">ID Card (Front)</h4>
                                    {selectedFarmer.id_card_front_url ? (
                                        <a href={selectedFarmer.id_card_front_url} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={selectedFarmer.id_card_front_url} 
                                                alt="ID Front" 
                                                className="w-full h-48 object-cover rounded-md border hover:opacity-90 transition-opacity"
                                            />
                                        </a>
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 rounded-md border">No Image</div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">ID Card (Back)</h4>
                                    {selectedFarmer.id_card_back_url ? (
                                        <a href={selectedFarmer.id_card_back_url} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={selectedFarmer.id_card_back_url} 
                                                alt="ID Back" 
                                                className="w-full h-48 object-cover rounded-md border hover:opacity-90 transition-opacity"
                                            />
                                        </a>
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 rounded-md border">No Image</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 mt-6">
                        <Button variant="outline" onClick={() => setSelectedFarmer(null)}>Cancel</Button>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <Button 
                                variant="destructive" 
                                onClick={() => handleDeclineClick(selectedFarmer)}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Decline & Delete
                            </Button>
                            {!selectedFarmer?.is_verified && (
                                <Button 
                                    className="bg-green-600 hover:bg-green-700" 
                                    onClick={() => {
                                        onVerify(selectedFarmer.id);
                                        setSelectedFarmer(null);
                                    }}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeclineConfirm} onOpenChange={setShowDeclineConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Decline Farmer Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the farmer's account and any uploaded documents. They will need to register again if they want to reapply. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDecline} className="bg-destructive hover:bg-destructive/90">
                            Decline & Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default FarmersTab;
