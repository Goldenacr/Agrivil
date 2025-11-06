
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        <path d="M1 1h22v22H1z" fill="none" />
    </svg>
);

const FormSection = ({ title, description, children }) => (
    <div className="space-y-4 p-6 border rounded-lg bg-white/30">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
);

const RegisterPage = () => {
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Common fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [region, setRegion] = useState('');
    const [cityTown, setCityTown] = useState('');
    const [nearestLandmark, setNearestLandmark] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [preferredDeliveryMethod, setPreferredDeliveryMethod] = useState('');

    // Customer specific
    const [preferredHub, setPreferredHub] = useState('');

    // Farmer specific
    const [nationalId, setNationalId] = useState('');
    const [residentialAddress, setResidentialAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [farmType, setFarmType] = useState('');
    const [farmSize, setFarmSize] = useState('');
    const [gpsLocation, setGpsLocation] = useState('');
    const [farmingExperience, setFarmingExperience] = useState('');
    const [farmAddress, setFarmAddress] = useState('');
    const [businessRegistrationStatus, setBusinessRegistrationStatus] = useState('');
    const [fdaCertificationStatus, setFdaCertificationStatus] = useState('');
    const [mainProducts, setMainProducts] = useState('');


    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (role === 'farmer') {
            const ghanaCardRegex = /^GHA-\d{9}-\d$/;
            if (!ghanaCardRegex.test(nationalId)) {
                toast({
                    variant: "destructive",
                    title: "Invalid Ghana Card ID",
                    description: "Please enter the ID in the format GHA-000000000-0.",
                });
                setLoading(false);
                return;
            }
        }

        const metadata = {
            full_name: fullName,
            role,
            phone_number: phoneNumber,
            gender,
            date_of_birth: dateOfBirth,
            region,
            city_town: cityTown,
            nearest_landmark: nearestLandmark,
            delivery_address: deliveryAddress,
            preferred_delivery_method: preferredDeliveryMethod,
        };

        if (role === 'customer') {
            Object.assign(metadata, {
                preferred_hub: preferredHub,
            });
        } else { // farmer
            Object.assign(metadata, {
                national_id: nationalId,
                residential_address: residentialAddress,
                district,
                farm_type: farmType,
                farm_size: farmSize,
                gps_location: gpsLocation,
                farming_experience: farmingExperience,
                farm_address: farmAddress,
                business_registration_status: businessRegistrationStatus,
                fda_certification_status: fdaCertificationStatus,
                main_products: mainProducts,
            });
        }

        const { error } = await signUp(email, password, { data: metadata });

        if (error) {
            toast({ variant: "destructive", title: "Registration Failed", description: error.message });
        } else {
            toast({ title: "Registration Successful!", description: "Please check your email to verify your account." });
            navigate('/');
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signInWithGoogle();
        setLoading(false);
    }

    return (
        <>
            <Helmet>
                <title>Register - Golden Acres</title>
                <meta name="description" content="Create an account with Golden Acres." />
            </Helmet>
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-transparent px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-4xl p-8 space-y-6 bg-card/90 backdrop-blur-sm rounded-2xl shadow-2xl border"
                >
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Join Golden Acres</h1>
                        <p className="mt-2 text-gray-600">Connecting You Directly to Farmers Across Ghana</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <Label htmlFor="role">I am registering as a...</Label>
                             <Select onValueChange={setRole} defaultValue={role} disabled={loading}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select your role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="farmer">Farmer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Personal Information */}
                        <FormSection title="1. Personal Information">
                            <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Doe" /></div>
                            <div><Label>Phone Number</Label><Input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required placeholder="024xxxxxxx" /></div>
                            <div><Label>Email Address</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" /></div>
                            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" /></div>
                            <div><Label>Gender</Label><Select onValueChange={setGender} value={gender}><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
                            <div><Label>Date of Birth</Label><Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} /></div>
                        </FormSection>

                        {/* Address & Location */}
                        <FormSection title="2. Address & Location">
                            <div><Label>Region</Label><Input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g., Greater Accra" /></div>
                            <div><Label>City/Town</Label><Input value={cityTown} onChange={e => setCityTown(e.target.value)} placeholder="e.g., Accra" /></div>
                            <div><Label>Nearest Landmark</Label><Input value={nearestLandmark} onChange={e => setNearestLandmark(e.target.value)} placeholder="e.g., Accra Mall" /></div>
                            <div><Label>Delivery Address</Label><Input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="House No, Street Name" /></div>
                        </FormSection>

                        {role === 'customer' && (
                            <>
                                <FormSection title="3. Account Preferences">
                                    <div><Label>Preferred Delivery Method</Label><Select onValueChange={setPreferredDeliveryMethod} value={preferredDeliveryMethod}><SelectTrigger><SelectValue placeholder="Select Delivery Method" /></SelectTrigger><SelectContent><SelectItem value="home">Direct to Home</SelectItem><SelectItem value="hub">Hub Pickup</SelectItem></SelectContent></Select></div>
                                    <div><Label>Preferred Hub</Label><Select onValueChange={setPreferredHub} value={preferredHub}><SelectTrigger><SelectValue placeholder="Select Hub" /></SelectTrigger><SelectContent><SelectItem value="madina">Madina</SelectItem><SelectItem value="bolgatanga">Bolgatanga</SelectItem><SelectItem value="ahafo">Ahafo Ano North</SelectItem><SelectItem value="lawra">Lawra</SelectItem><SelectItem value="savannah">Northern Savannah</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                                </FormSection>
                            </>
                        )}

                        {role === 'farmer' && (
                            <>
                                <FormSection title="Farmer Details">
                                    <div><Label>National ID (Ghana Card)</Label><Input value={nationalId} onChange={e => setNationalId(e.target.value)} placeholder="GHA-000000000-0" /></div>
                                    <div><Label>Residential Address</Label><Input value={residentialAddress} onChange={e => setResidentialAddress(e.target.value)} /></div>
                                    <div><Label>District</Label><Input value={district} onChange={e => setDistrict(e.target.value)} /></div>
                                    <div><Label>Farm Address</Label><Input value={farmAddress} onChange={e => setFarmAddress(e.target.value)} /></div>
                                    <div><Label>Farm Type</Label><Input value={farmType} onChange={e => setFarmType(e.target.value)} placeholder="e.g., Crop, Livestock, Mixed" /></div>
                                    <div><Label>Farm Size (in acres)</Label><Input value={farmSize} onChange={e => setFarmSize(e.target.value)} /></div>
                                    <div><Label>GPS Location of Farm</Label><Input value={gpsLocation} onChange={e => setGpsLocation(e.target.value)} /></div>
                                    <div><Label>Years of Farming Experience</Label><Input type="number" value={farmingExperience} onChange={e => setFarmingExperience(e.target.value)} /></div>
                                    <div><Label>Business Registration Status</Label><Select onValueChange={setBusinessRegistrationStatus} value={businessRegistrationStatus}><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent><SelectItem value="registered">Registered</SelectItem><SelectItem value="not_registered">Not Registered</SelectItem></SelectContent></Select></div>
                                    <div><Label>FDA Certification Status</Label><Select onValueChange={setFdaCertificationStatus} value={fdaCertificationStatus}><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent><SelectItem value="certified">Certified</SelectItem><SelectItem value="not_certified">Not Certified</SelectItem><SelectItem value="in_progress">In Progress</SelectItem></SelectContent></Select></div>
                                    <div className="sm:col-span-2"><Label>Main Products Cultivated/Reared</Label><Input value={mainProducts} onChange={e => setMainProducts(e.target.value)} placeholder="e.g., Maize, Yam, Poultry" /></div>
                                </FormSection>
                            </>
                        )}

                        <Button type="submit" className="w-full !mt-8 bg-primary hover:bg-primary/90" disabled={loading}>{loading ? 'Registering...' : 'Create Account'}</Button>
                    </form>
                     <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div></div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}><GoogleIcon /> Sign Up with Google</Button>
                     <p className="text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link></p>
                     <p className="text-center text-sm text-gray-600">Trouble registering? <a href="https://wa.me/233557488116" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Contact Support</a></p>
                </motion.div>
            </div>
        </>
    );
};

export default RegisterPage;
