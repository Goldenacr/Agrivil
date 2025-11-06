import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FarmerOnboardingPage = () => {
  const benefits = [
    { icon: DollarSign, text: 'Get fair and transparent pricing for your produce.' },
    { icon: Users, text: 'Reach thousands of new customers in urban areas.' },
    { icon: Check, text: 'Simple tools to manage your products and sales.' },
  ];

  return (
    <>
      <Helmet>
        <title>Farmer Onboarding - Agrivil</title>
        <meta name="description" content="Join Agrivil as a farmer and start selling your produce directly to a wider market. Enjoy fair prices and reliable logistics." />
      </Helmet>
      <div className="bg-white">
        <section className="bg-green-50 py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-5xl font-bold text-gray-900 mb-4"
            >
                Join the Agrivil Farmer Network
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
            >
                Grow your business, increase your income, and become part of a digital agricultural revolution.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                    <Link to="/register">
                        Join as a Farmer <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900">Why Sell With Agrivil?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-8 rounded-lg shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <benefit.icon className="w-12 h-12 text-green-600 mb-4" />
                            <p className="text-lg text-gray-700">{benefit.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0 bg-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">1</div>
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold mb-2">Register Your Farm</h3>
                            <p className="text-gray-600">Create your free farmer account in minutes. Provide basic information about your farm and the produce you grow.</p>
                        </div>
                    </div>
                     <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                        <div className="flex-shrink-0 bg-yellow-500 text-black w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">2</div>
                        <div className="text-center md:text-right">
                            <h3 className="text-2xl font-bold mb-2">List Your Products</h3>
                            <p className="text-gray-600">Use your dashboard to easily upload products, set your own prices, and manage your inventory. Our admin can also help!</p>
                        </div>
                    </div>
                     <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0 bg-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">3</div>
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold mb-2">Start Selling</h3>
                            <p className="text-gray-600">Once your products are live, customers can purchase them directly. We handle the payment and logistics, so you can focus on farming.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </>
  );
};

export default FarmerOnboardingPage;