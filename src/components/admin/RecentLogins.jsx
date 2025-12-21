
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const timeAgo = (date) => {
    if (!date) return 'never';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const RecentLogins = ({ users }) => {
    const sortedUsers = [...users]
        .filter(u => u.last_sign_in_at)
        .sort((a, b) => new Date(b.last_sign_in_at) - new Date(a.last_sign_in_at))
        .slice(0, 5);

    return (
        <Card className="h-full border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-6">
                    {sortedUsers.length > 0 ? sortedUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-semibold leading-none truncate">{user.full_name || 'Unknown User'}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]" title={user.email}>{user.email}</p>
                                </div>
                            </div>
                            <div className="shrink-0 pl-2">
                                <Badge variant="secondary" className="text-[10px] font-medium whitespace-nowrap px-2 py-0.5 h-6 flex items-center">
                                    {timeAgo(user.last_sign_in_at)}
                                </Badge>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent logins found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentLogins;
