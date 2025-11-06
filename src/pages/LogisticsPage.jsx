import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Truck, Package, ShieldCheck, MapPin } from 'lucide-react';

const LogisticsPage = () => {
  return (
    <>
      <Helmet>
        <title>Logistics Services - Agrivil</title>
        <meta name="description" content="Learn about our efficient logistics, packaging, and delivery services that connect farms to your table." />
      </Helmet>

      <div className="bg-white">
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-yellow-500/80 z-10"></div>
          <img class="absolute inset-0 w-full h-full object-cover" alt="Agrivil delivery truck on a road" src="https://images.unsplash.com/photo-1612977879188-a89c1f82b33b" />
          <div className="relative z-20 text-center text-white px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-5xl font-bold mb-4"
            >
              Our Logistics Network
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl max-w-2xl mx-auto"
            >
              Seamlessly connecting farms to your doorstep with care and efficiency.
            </motion.p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Deliver Freshness</h2>
              <p className="text-xl text-gray-600">A reliable system built on three core pillars.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
                <Truck className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Efficient Transport</h3>
                <p className="text-gray-600">
                  Our modern, refrigerated fleet ensures produce is transported from the farm to our hubs while maintaining optimal temperature and freshness.
                </p>
              </div>
              <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
                <Package className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Packaging</h3>
                <p className="text-gray-600">
                  We use eco-friendly and protective packaging materials to prevent spoilage, reduce waste, and preserve the quality of every item.
                </p>
              </div>
              <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
                <ShieldCheck className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Last-Mile Delivery</h3>
                <p className="text-gray-600">
                  Our trained delivery partners handle the final leg of the journey, ensuring your order arrives on time and in perfect condition.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                         <img class="w-full h-[400px] object-cover rounded-lg shadow-xl" alt="Map showing delivery routes" src="https://images.unsplash.com/photo-1601037295085-6c17aa4e40a7" />
                    </motion.div>
                     <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                     >
                        <MapPin className="w-12 h-12 text-green-600 mb-4" />
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Coverage</h2>
                        <p className="text-lg text-gray-600 mb-4">
                            Agrivil's logistics network is constantly expanding. We currently serve major urban centers and are actively working to bring fresh produce to more communities across Uganda.
                        </p>
                        <p className="text-lg text-gray-600">
                            Our strategically placed collection hubs ensure we can quickly gather produce from remote farms and begin the journey to your table without delay.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>

      </div>
    </>
  );
};

export default LogisticsPage;