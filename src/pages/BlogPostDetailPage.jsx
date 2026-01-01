
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Tag, Loader2, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

const BlogPostDetailPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select(`
                    *,
                    author:author_id ( full_name, avatar_url )
                `)
                .eq('id', id)
                .single();

            if (!error) {
                setPost(data);
            } else {
                console.error("Error fetching post:", error);
            }
            setLoading(false);
        };

        fetchPost();
    }, [id]);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        
        // Handle YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return { type: 'iframe', src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
        }

        // Handle Vimeo
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
        }

        // Assume direct file (Supabase storage or other direct link)
        return { type: 'video', src: url };
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
    if (!post) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Post not found</h2><Link to="/blog" className="text-primary hover:underline mt-4 block">Back to Blog</Link></div>;

    const videoContent = post.video_url ? getEmbedUrl(post.video_url) : null;

    return (
        <>
            <Helmet>
                <title>{post.title} - Agribridge Blog</title>
                <meta name="description" content={post.excerpt || post.title} />
            </Helmet>

            <div className="bg-background min-h-screen pb-12">
                {/* Hero Image */}
                <div className="w-full h-64 md:h-96 relative bg-gray-200">
                    <img 
                        src={post.image_url || "https://images.unsplash.com/photo-1500937386664-56d1dfef38ec?q=80&w=2070&auto=format&fit=crop"} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end">
                         <div className="container mx-auto px-4 pb-8 md:pb-12 text-white">
                             <Button asChild variant="link" className="text-white/80 pl-0 hover:text-white mb-2">
                                <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog</Link>
                            </Button>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight max-w-4xl">{post.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white/90">
                                <span className="bg-primary px-3 py-1 rounded-full text-white font-medium text-xs md:text-sm">{post.category}</span>
                                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(post.created_at), 'MMM dd, yyyy')}</div>
                                {post.author && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{post.author.full_name}</span>
                                    </div>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 mt-8 md:mt-12 max-w-4xl">
                    <div className="bg-white dark:bg-card p-6 md:p-10 rounded-xl shadow-sm border border-border">
                        
                        {/* Video Player Section */}
                        {videoContent && (
                            <div className="mb-10 rounded-xl overflow-hidden shadow-md bg-black">
                                <div className="aspect-video w-full relative">
                                    {videoContent.type === 'iframe' ? (
                                        <iframe 
                                            src={videoContent.src} 
                                            title="Video player"
                                            className="w-full h-full absolute inset-0" 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <video 
                                            controls 
                                            className="w-full h-full absolute inset-0"
                                            poster={post.image_url} // Use blog cover as poster
                                        >
                                            <source src={videoContent.src} type="video/mp4" />
                                            <source src={videoContent.src} type="video/webm" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </div>
                                <div className="p-3 bg-muted/30 text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                                    <PlayCircle className="w-4 h-4"/> Video Content Available
                                </div>
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-a:text-primary">
                            {post.content.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogPostDetailPage;
          
