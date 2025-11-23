import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ImageUpload from '@/components/admin/ImageUpload';
import { Loader2 } from 'lucide-react';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

const BlogModal = ({ isOpen, onOpenChange, post, onSave }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: '' });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (post) {
            setForm({ title: post.title, content: post.content, excerpt: post.excerpt, category: post.category });
        } else {
            setForm({ title: '', content: '', excerpt: '', category: '' });
        }
        setImageFile(null);
    }, [post, isOpen]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const uploadFile = async (file, bucket) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
        if (uploadError) {
            toast({ variant: 'destructive', title: 'Image upload failed', description: uploadError.message });
            return { error: uploadError };
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return { publicUrl: data.publicUrl, error: null };
    };

    const handleSubmit = async () => {
        setLoading(true);
        let imageUrl = post?.image_url;
        if (imageFile) {
            const { publicUrl, error } = await uploadFile(imageFile, 'blog_images');
            if (error) {
                setLoading(false);
                return;
            }
            imageUrl = publicUrl;
        }

        const blogData = { ...form, image_url: imageUrl, author_id: user.id };
        const { error } = post
            ? await supabase.from('blog_posts').update(blogData).eq('id', post.id)
            : await supabase.from('blog_posts').insert(blogData);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Failed to save post', description: error.message });
        } else {
            toast({ title: `Blog post ${post ? 'saved' : 'created'}` });
            onSave();
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px] bg-card/90 backdrop-blur-sm border">
                <DialogHeader>
                    <DialogTitle>{post ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <motion.div variants={formVariants} initial="hidden" animate="visible" custom={0}>
                        <Input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
                    </motion.div>
                    <motion.div variants={formVariants} initial="hidden" animate="visible" custom={1}>
                        <Input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
                    </motion.div>
                    <motion.div variants={formVariants} initial="hidden" animate="visible" custom={2}>
                        <Textarea name="excerpt" placeholder="Excerpt (a short summary)" value={form.excerpt} onChange={handleChange} />
                    </motion.div>
                    <motion.div variants={formVariants} initial="hidden" animate="visible" custom={3}>
                        <Textarea name="content" placeholder="Full Content (Markdown is supported)" rows={10} value={form.content} onChange={handleChange} />
                    </motion.div>
                    <motion.div variants={formVariants} initial="hidden" animate="visible" custom={4}>
                         <ImageUpload imageFile={imageFile} onFileChange={setImageFile} />
                    </motion.div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Saving...' : 'Save Post'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BlogModal;