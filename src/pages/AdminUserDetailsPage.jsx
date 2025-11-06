
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, Tractor, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FancyLoader = () => (
  <div className="fixed inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="fancy-loader"></div>
  </div>
);

const DetailCard = ({ icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border"
  >
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-semibold ml-3">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </motion.div>
);

const DetailItem = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="sm:col-span-2 text-gray-800">{value || 'Not Provided'}</span>
  </div>
);

const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({ variant: 'destructive', title: 'Error fetching user details', description: error.message });
      } else {
        setUser(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, [id, toast]);

  if (loading) return <FancyLoader />;
  if (!user) return <div className="text-center py-12">User not found.</div>;

  return (
    <>
      <Helmet>
        <title>User Details: {user.full_name} - Golden Acres</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-transparent">
        <Link to="/admin-dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center mb-8">
          <div className="flex-shrink-0">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${user.role === 'farmer' ? 'bg-green-500' : 'bg-yellow-500'}`}>
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-5">
            <h1 className="text-3xl font-bold">{user.full_name}</h1>
            <p className="text-gray-600 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <DetailCard icon={<User className="text-primary" /> } title="Personal Information">
              <DetailItem label="Full Name" value={user.full_name} />
              <DetailItem label="Phone Number" value={user.phone_number} />
              <DetailItem label="Gender" value={user.gender} />
              <DetailItem label="Date of Birth" value={user.date_of_birth} />
              <DetailItem label="Joined On" value={new Date(user.created_at).toLocaleDateString()} />
              <DetailItem label="National ID" value={user.national_id} />
            </DetailCard>

            <DetailCard icon={<MapPin className="text-primary" />} title="Address & Location">
              <DetailItem label="Region" value={user.region} />
              <DetailItem label="City/Town" value={user.city_town} />
              <DetailItem label="District" value={user.district} />
              <DetailItem label="Nearest Landmark" value={user.nearest_landmark} />
              <DetailItem label="Residential Address" value={user.residential_address} />
              <DetailItem label="Delivery Address" value={user.delivery_address} />
              <DetailItem label="Preferred Delivery" value={user.preferred_delivery_method} />
              <DetailItem label="Preferred Hub" value={user.preferred_hub} />
            </DetailCard>
          </div>
          
          {user.role === 'farmer' && (
            <div className="space-y-8">
                <DetailCard icon={<Tractor className="text-primary" />} title="Farm Details">
                    <DetailItem label="Farm Address" value={user.farm_address} />
                    <DetailItem label="Farm Type" value={user.farm_type} />
                    <DetailItem label="Farm Size" value={user.farm_size} />
                    <DetailItem label="GPS Location" value={user.gps_location} />
                    <DetailItem label="Farming Experience" value={`${user.farming_experience} years`} />
                    <DetailItem label="Main Products" value={user.main_products} />
                </DetailCard>

                <DetailCard icon={<FileText className="text-primary" />} title="Official Information">
                    <DetailItem label="Business Registration" value={user.business_registration_status} />
                    <DetailItem label="FDA Certification" value={user.fda_certification_status} />
                </DetailCard>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUserDetailsPage;
