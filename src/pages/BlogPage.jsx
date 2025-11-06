
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        
        setPosts(data);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to load blog posts', description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [toast]);

  const showToast = () => {
    toast({
      title: "🚧 Feature In Progress",
      description: "The full blog post view is coming soon!",
    });
  };

  return (
    <>
      <Helmet>
        <title>Blog - Golden Acres</title>
        <meta name="description" content="Read the latest news, articles, and insights on agriculture, technology, and community from Golden Acres." />
      </Helmet>
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900">Golden Acres Blog</h1>
                <p className="mt-4 text-xl text-gray-600">News, insights, and stories from the heart of agriculture.</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post, index) => (
                      <motion.div 
                          key={post.id}
                          className="bg-card/90 backdrop-blur-sm rounded-xl shadow-xl border overflow-hidden group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                      >
                          <div onClick={showToast} className="cursor-pointer">
                              <div className="h-56 bg-gray-200">
                                  <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={post.title} src={post.image_url || 'https://images.unsplash.com/photo-1595872018818-97555653a011'} />
                              </div>
                              <div className="p-6">
                                  <p className="text-sm text-primary font-semibold mb-2">{post.category}</p>
                                  <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition">{post.title}</h2>
                                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                                  <div className="flex justify-between items-center text-sm text-gray-500">
                                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                      <span className="flex items-center font-semibold text-primary">
                                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card/80 backdrop-blur-sm rounded-xl border">
                <h2 className="text-2xl font-semibold text-gray-700">No Blog Posts Yet</h2>
                <p className="text-gray-500 mt-2">Check back later for news and updates!</p>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
