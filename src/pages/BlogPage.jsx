
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, ArrowRight, BookOpen, Loader2, PlayCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { format } from 'date-fns';

const BlogPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            let query = supabase
                .from('blog_posts')
                .select(`
                    *,
                    author:author_id ( full_name )
                `)
                .order('created_at', { ascending: false });

            if (selectedCategory !== 'All') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;
            
            if (error) {
                console.error("Error fetching blog posts:", error);
            } else {
                setPosts(data || []);
            }
            setLoading(false);
        };

        fetchPosts();
    }, [selectedCategory]);

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ['All', 'Agriculture', 'Technology', 'Farming Tips', 'Market News', 'Success Stories'];

    return (
        <>
            <Helmet>
                <title>Blog - Agribridge</title>
                <meta name="description" content="Latest news, farming tips, and success stories from the Agribridge community." />
            </Helmet>

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Hero Section */}
                <div className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Agribridge Insights</h1>
                        <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto font-light">
                            Discover expert farming tips, market trends, and inspiring stories from our community.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 -mt-8">
                    {/* Search and Filter */}
                    <div className="bg-white dark:bg-card rounded-xl shadow-lg p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input 
                                placeholder="Search articles..." 
                                className="pl-10 h-12"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.map(cat => (
                                <Button 
                                    key={cat} 
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(cat)}
                                    className="whitespace-nowrap rounded-full px-6"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => (
                                <Card key={post.id} className="flex flex-col h-full hover:shadow-xl transition-all duration-300 group border-none shadow-md overflow-hidden bg-white dark:bg-card">
                                    <div className="relative h-56 overflow-hidden">
                                        <img 
                                            src={post.image_url || "https://images.unsplash.com/photo-1500937386664-56d1dfef38ec?q=80&w=2070&auto=format&fit=crop"} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 text-primary hover:bg-white font-bold backdrop-blur-sm shadow-sm">
                                                {post.category}
                                            </Badge>
                                        </div>
                                        {post.video_url && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg">
                                                    <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                                            {post.author && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author.full_name}</span>}
                                        </div>
                                        <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                                            {post.excerpt || post.content.substring(0, 120) + '...'}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-0 pb-6">
                                        <Button asChild variant="ghost" className="w-full justify-between hover:bg-primary/5 group/btn px-0">
                                            <Link to={`/blog/${post.id}`}>
                                                <span className="font-semibold text-primary">Read Article</span>
                                                <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We couldn't find any blog posts matching your search criteria. Try different keywords or category.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-6"
                                onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BlogPage;
                  
