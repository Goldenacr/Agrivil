
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, ShoppingBag, Truck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const HomePage = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Registered Farmers', value: '500+' },
    { icon: ShoppingBag, label: 'Products Listed', value: '2,000+' },
    { icon: Truck, label: 'Deliveries Made', value: '10,000+' },
    { icon: TrendingUp, label: 'Customer Satisfaction', value: '98%' }
  ];

  return (
    <>
      <Helmet>
        <title>Golden Acres - Farm to Market Platform</title>
        <meta name="description" content="Connect farmers directly to markets. Fresh produce, fair prices, and reliable logistics." />
      </Helmet>

      <div className="min-h-screen bg-transparent">
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-yellow-600/70 z-10"></div>
          <img class="absolute inset-0 w-full h-full object-cover" alt="Farmers working in lush green fields" src="https://images.unsplash.com/photo-1701848724187-1fbe4682cb51" />
          
          <div className="relative z-20 text-center text-white px-4 max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Fresh From Farm to Your Table
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8"
            >
              Empowering farmers, connecting communities, delivering freshness
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground w-full sm:w-auto">
                <Link to="/marketplace">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
             {!user && (
                <>
                    <Link to="/login">
                        <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/10 w-full sm:w-auto">
                        Sign In
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        Sign Up
                        </Button>
                    </Link>
                </>
             )}
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border text-center"
                >
                  <stat.icon className="w-12 h-12 mx-auto text-primary mb-4" />
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Golden Acres?</h2>
              <p className="text-xl text-gray-600">We bridge the gap between farmers and consumers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card/90 backdrop-blur-sm p-8 rounded-xl shadow-xl border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <img class="w-full h-48 object-cover rounded-lg mb-4" alt="Fresh organic vegetables" src="https://images.unsplash.com/photo-1616259525716-55576be0211c" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fresh Produce</h3>
                <p className="text-gray-600">
                  Direct from farms to ensure maximum freshness and quality for every product.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card/90 backdrop-blur-sm p-8 rounded-xl shadow-xl border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <img class="w-full h-48 object-cover rounded-lg mb-4" alt="Fair pricing for farmers" src="https://images.unsplash.com/photo-1689143944836-e9d9cbc50f97" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fair Prices</h3>
                <p className="text-gray-600">
                  Farmers get fair compensation while customers enjoy competitive pricing.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card/90 backdrop-blur-sm p-8 rounded-xl shadow-xl border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <img class="w-full h-48 object-cover rounded-lg mb-4" alt="Reliable delivery truck" src="https://images.unsplash.com/photo-1616649623526-8b2bf1468fad" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Reliable Logistics</h3>
                <p className="text-gray-600">
                  Efficient transport and packaging ensure your produce arrives fresh and on time.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/90 text-white backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8">Join thousands of farmers and customers on Golden Acres today</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Link to="/register">
                  Create Account
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
