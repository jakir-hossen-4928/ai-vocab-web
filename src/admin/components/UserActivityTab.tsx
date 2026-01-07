import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getAllUsersAnalytics } from '@/services/analyticsService';
import { UserAnalytics } from '@/types/analytics';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Users, Clock, BookOpen, FileText, Search as SearchIcon, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function UserActivityTab() {
    const [usersAnalytics, setUsersAnalytics] = useState<UserAnalytics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'lastActive' | 'totalTime' | 'vocabularies' | 'resources'>('lastActive');

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsersAnalytics();
            setUsersAnalytics(data);
        } catch (error) {
            console.error('Failed to load user analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter and sort users
    const filteredUsers = usersAnalytics
        .filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'lastActive':
                    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
                case 'totalTime':
                    return b.totalTimeSpent - a.totalTimeSpent;
                case 'vocabularies':
                    return b.learningProgress.uniqueVocabulariesRead.length - a.learningProgress.uniqueVocabulariesRead.length;
                case 'resources':
                    return b.learningProgress.uniqueResourcesRead.length - a.learningProgress.uniqueResourcesRead.length;
                default:
                    return 0;
            }
        });

    // Calculate aggregate stats
    const totalUsers = usersAnalytics.length;
    const activeToday = usersAnalytics.filter(u => {
        const lastActive = new Date(u.lastActive);
        const today = new Date();
        return lastActive.toDateString() === today.toDateString();
    }).length;
    const totalTimeSpent = usersAnalytics.reduce((sum, u) => sum + u.totalTimeSpent, 0);
    const avgTimePerUser = totalUsers > 0 ? totalTimeSpent / totalUsers : 0;

    // Format milliseconds to readable time
    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeToday}</div>
                        <p className="text-xs text-muted-foreground">Users active today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
                        <p className="text-xs text-muted-foreground">Cumulative usage</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Time/User</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatTime(avgTimePerUser)}</div>
                        <p className="text-xs text-muted-foreground">Average engagement</p>
                    </CardContent>
                </Card>
            </div>

            {/* User Activity Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>User Activity Details</CardTitle>
                            <CardDescription>Detailed breakdown of user engagement and learning progress</CardDescription>
                        </div>
                        <Button onClick={loadAnalytics} variant="outline" size="sm">
                            Refresh
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="relative flex-1 max-w-sm">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={sortBy === 'lastActive' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('lastActive')}
                            >
                                Last Active
                            </Button>
                            <Button
                                variant={sortBy === 'totalTime' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('totalTime')}
                            >
                                Time Spent
                            </Button>
                            <Button
                                variant={sortBy === 'vocabularies' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('vocabularies')}
                            >
                                Vocabularies
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead>Total Time</TableHead>
                                    <TableHead>Sessions</TableHead>
                                    <TableHead>Vocabularies</TableHead>
                                    <TableHead>Resources</TableHead>
                                    <TableHead>Flashcards</TableHead>
                                    <TableHead>Searches</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{user.displayName}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {format(new Date(user.lastActive), 'MMM d, yyyy')}
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(user.lastActive), 'h:mm a')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {formatTime(user.totalTimeSpent)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.sessions.length}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="h-3 w-3 text-blue-500" />
                                                    <span className="font-medium">{user.learningProgress.uniqueVocabulariesRead.length}</span>
                                                    <span className="text-xs text-muted-foreground">/ {user.featureUsage.vocabulariesViewed}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3 text-purple-500" />
                                                    <span className="font-medium">{user.learningProgress.uniqueResourcesRead.length}</span>
                                                    <span className="text-xs text-muted-foreground">/ {user.featureUsage.resourcesViewed}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.learningProgress.flashcardSessions}</TableCell>
                                            <TableCell>{user.featureUsage.dictionarySearches}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
