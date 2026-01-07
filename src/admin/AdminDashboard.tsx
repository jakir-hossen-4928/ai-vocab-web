import { useState, useMemo, useEffect } from "react";
import { useVocabularies } from "@/hooks/useVocabularies";
import { useResourcesSimple } from "@/hooks/useResources";
import { listeningService } from "@/services/listeningService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";
import {
    BookOpen,
    Activity,
    Type,
    Download,
    FileText,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Users,
    User,
    ImageIcon,
    Clock,
    Database,
    Search,
    Heart,
    Zap,
    TrendingUp,
    Target,
    Award,
    Sparkles,
    BarChart3,
    PieChart as PieChartIcon,
    FileDown,
    Headphones
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    format,
    subDays,
    isSameDay,
    eachDayOfInterval,
    getDay,
    getHours,
    isValid,
    parseISO
} from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import partOfSpeechData from "@/data/partOfSpeech.json";
import { toast } from "sonner";

import { safeDate } from "@/utils/dateUtils";
import { UserActivityTab } from "./components/UserActivityTab";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Helper Components
function StatCard({ title, value, icon: Icon, trend, trendUp, subtext, color, bgColor }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={cn("hover:shadow-lg transition-all duration-300 border-l-4 overflow-hidden", bgColor)} style={{ borderLeftColor: 'currentColor' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <Icon className={cn("h-4 w-4", color)} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    {(trend || subtext) && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {trend && <span className={trendUp ? "text-green-500 font-medium" : ""}>{trend}</span>}
                            {subtext && <span>{subtext}</span>}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function QualityCard({ title, score, icon: Icon, description, color }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between mb-2">
                    <div className="text-2xl font-bold">{score}%</div>
                    <span className="text-xs text-muted-foreground">Health Score</span>
                </div>
                <Progress value={score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-3">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function QualityMetricCard({ title, score, count, total, icon: Icon, color }: any) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg bg-muted", color)}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm">{title}</span>
                    </div>
                    <Badge variant={score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive"}>
                        {score}%
                    </Badge>
                </div>
                <Progress value={score} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                    {count.toLocaleString()} of {total.toLocaleString()} words
                </p>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    const { data: vocabularies = [], isLoading: isLoadingVocabs, refresh, isRefetching } = useVocabularies();
    const { data: resources = [], isLoading: isLoadingResources } = useResourcesSimple();

    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
    const [userRoles, setUserRoles] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [ieltsStats, setIeltsStats] = useState({ totalTests: 0 });

    // Fetch user roles
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const q = query(collection(db, "user_roles"));
                const snapshot = await getDocs(q);
                const roles = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUserRoles(roles);
            } catch (error) {
                console.error("Error fetching user roles:", error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        const fetchIeltsStats = async () => {
            try {
                const stats = await listeningService.getDataStats();
                setIeltsStats(stats);
            } catch (e) {
                console.error("Failed to fetch IELTS stats", e);
            }
        }

        fetchUserRoles();
        fetchIeltsStats();
    }, []);

    // Advanced Stats Calculations
    const stats = useMemo(() => {
        const totalWords = vocabularies?.length || 0;
        const totalResources = resources?.length || 0;
        const now = new Date();

        // Filter valid dates for time-based analytics
        const validVocabs = vocabularies.filter(v => safeDate(v.createdAt) !== null);

        // 1. User Stats (Enhanced with Roles)
        const uniqueUsers = new Set(
            vocabularies
                .map(v => v.userId)
                .filter(id => id && id.trim() !== '')
        ).size;

        // If 0 unique users detected but we have words, assume at least 1 (admin/current) or just show 0 if purely server side
        const activeUsers = uniqueUsers === 0 && totalWords > 0 ? 1 : uniqueUsers;

        // User role statistics
        const totalUsers = userRoles.length;
        const adminUsers = userRoles.filter((u: any) => u.role === 'admin').length;
        const normalUsers = userRoles.filter((u: any) => u.role === 'user').length;

        // 2. Data Quality Metrics (Enhanced)
        const withExamples = vocabularies.filter(v => v.examples && v.examples.length > 0).length;
        const withSynonyms = vocabularies.filter(v => v.synonyms && v.synonyms.length >= 3).length;
        const withAntonyms = vocabularies.filter(v => v.antonyms && v.antonyms.length >= 3).length;
        const withPronunciation = vocabularies.filter(v => v.pronunciation && v.pronunciation.trim() !== '').length;
        const withExplanation = vocabularies.filter(v => v.explanation && v.explanation.length >= 50).length;
        const withRelatedWords = vocabularies.filter(v => v.relatedWords && v.relatedWords.length > 0).length;
        const verbsWithForms = vocabularies.filter(v => v.partOfSpeech === 'Verb' && v.verbForms).length;
        const totalVerbs = vocabularies.filter(v => v.partOfSpeech === 'Verb').length;

        // Calculate completeness scores
        const qualityScores = {
            examples: totalWords > 0 ? Math.round((withExamples / totalWords) * 100) : 0,
            synonyms: totalWords > 0 ? Math.round((withSynonyms / totalWords) * 100) : 0,
            antonyms: totalWords > 0 ? Math.round((withAntonyms / totalWords) * 100) : 0,
            pronunciation: totalWords > 0 ? Math.round((withPronunciation / totalWords) * 100) : 0,
            explanation: totalWords > 0 ? Math.round((withExplanation / totalWords) * 100) : 0,
            relatedWords: totalWords > 0 ? Math.round((withRelatedWords / totalWords) * 100) : 0,
            verbForms: totalVerbs > 0 ? Math.round((verbsWithForms / totalVerbs) * 100) : 0,
            overall: totalWords > 0 ? Math.round(
                ((withExamples + withSynonyms + withAntonyms + withPronunciation + withExplanation + withRelatedWords) / (totalWords * 6)) * 100
            ) : 0
        };

        // Field completeness for radar chart
        const fieldCompleteness = [
            { field: 'Examples', score: qualityScores.examples },
            { field: 'Synonyms', score: qualityScores.synonyms },
            { field: 'Antonyms', score: qualityScores.antonyms },
            { field: 'Pronunciation', score: qualityScores.pronunciation },
            { field: 'Explanation', score: qualityScores.explanation },
            { field: 'Related Words', score: qualityScores.relatedWords }
        ];

        // 3. Content Velocity (words per day over last 30 days)
        const last30Days = subDays(now, 30);
        const wordsLast30Days = validVocabs.filter(v => {
            const d = safeDate(v.createdAt);
            return d && d >= last30Days;
        }).length;
        const avgWordsPerDay = Math.round((wordsLast30Days / 30) * 10) / 10;

        const resourcesLast30Days = resources.filter((r: any) => {
            const d = safeDate(r.createdAt);
            return d && d >= last30Days;
        }).length;
        const avgResourcesPerWeek = Math.round((resourcesLast30Days / 4.3) * 10) / 10;

        // 4. Top Vocabulary by Completeness
        const topQualityWords = vocabularies
            .map(v => {
                let score = 0;
                if (v.examples && v.examples.length > 0) score++;
                if (v.synonyms && v.synonyms.length >= 3) score++;
                if (v.antonyms && v.antonyms.length >= 3) score++;
                if (v.pronunciation && v.pronunciation.trim() !== '') score++;
                if (v.explanation && v.explanation.length >= 50) score++;
                if (v.relatedWords && v.relatedWords.length > 0) score++;
                if (v.partOfSpeech === 'Verb' && v.verbForms) score++;
                return { ...v, qualityScore: score };
            })
            .sort((a, b) => b.qualityScore - a.qualityScore)
            .slice(0, 10);

        // 5. Contributions / Heatmap Data (Last 365 days)
        const yearStart = subDays(now, 364);
        const daysMap = new Map<string, number>();

        validVocabs.forEach(v => {
            const date = safeDate(v.createdAt);
            if (date) {
                const dateStr = format(date, 'yyyy-MM-dd');
                daysMap.set(dateStr, (daysMap.get(dateStr) || 0) + 1);
            }
        });

        const heatmapData = [];
        let maxCount = 0;
        const heatmapDays = eachDayOfInterval({ start: yearStart, end: now });

        for (const day of heatmapDays) {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = daysMap.get(dateStr) || 0;
            if (count > maxCount) maxCount = count;
            heatmapData.push({ date: day, count, dateStr });
        }

        // 6. Hourly Distribution
        const hourlyDist = new Array(24).fill(0);
        const dayOfWeekDist = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(name => ({ name, count: 0 }));

        validVocabs.forEach(v => {
            const d = safeDate(v.createdAt);
            if (d) {
                hourlyDist[getHours(d)]++;
                dayOfWeekDist[getDay(d)].count++;
            }
        });

        const hourlyData = hourlyDist.map((count, hour) => ({
            hour: format(new Date().setHours(hour), 'ha'), // 1am, 2pm
            count
        }));

        // 7. POS Distribution
        const predefinedPOS = partOfSpeechData;
        const posCalc: Record<string, number> = {};

        // Initialize all categories to 0
        predefinedPOS.forEach(pos => posCalc[pos] = 0);

        vocabularies.forEach(curr => {
            const rawPos = curr.partOfSpeech?.trim();
            if (!rawPos) return;

            // Try to find a match in our predefined list (case-insensitive)
            const matchedKey = predefinedPOS.find(p => p.toLowerCase() === rawPos.toLowerCase());

            if (matchedKey) {
                posCalc[matchedKey]++;
            }
        });

        // Filter out categories with 0 count to keep chart clean
        const pieData = Object.entries(posCalc)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 8. Growth Data
        const growthDays = timeRange === 'week' ? 7 : 30;
        const growthData = [];
        for (let i = growthDays - 1; i >= 0; i--) {
            const date = subDays(now, i);
            const dayStr = format(date, 'MMM dd');
            const dateStr = format(date, 'yyyy-MM-dd');
            // Count words added on this specific day
            const addedCount = validVocabs.filter(v => {
                const d = safeDate(v.createdAt);
                return d && format(d, 'yyyy-MM-dd') === dateStr;
            }).length;

            // Count resources added on this specific day
            const resourcesCount = resources.filter((r: any) => {
                const d = safeDate(r.createdAt);
                return d && format(d, 'yyyy-MM-dd') === dateStr;
            }).length;

            growthData.push({
                date: dayStr,
                words: addedCount,
                resources: resourcesCount,
                total: addedCount + resourcesCount,
                fullDate: date
            });
        }

        // 9. Recent Items (Mixed Vocab and Resources)
        const vocabularyItems = vocabularies.map(v => ({ ...v, type: 'vocabulary' }));
        const resourceItems = resources.map((r: any) => ({ ...r, type: 'resource', english: r.title || 'Untitled Resource', bangla: 'Resource' }));

        const allItems = [...vocabularyItems, ...resourceItems];

        const recentActivity = allItems
            .filter(item => safeDate(item.createdAt) !== null)
            .sort((a, b) => {
                const dateA = safeDate(a.createdAt)!;
                const dateB = safeDate(b.createdAt)!;
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 10);

        const wordsAddedToday = validVocabs.filter(v => {
            const d = safeDate(v.createdAt);
            return d && isSameDay(d, now);
        }).length;

        const resourcesAddedToday = resources.filter((r: any) => {
            const d = safeDate(r.createdAt);
            return d && isSameDay(d, now);
        }).length;

        return {
            totalWords,
            totalResources,
            wordsAddedToday,
            resourcesAddedToday,
            activeUsers,
            totalUsers,
            adminUsers,
            normalUsers,
            pieData,
            growthData,
            recentActivity,
            qualityScores,
            heatmapData,
            maxCount,
            hourlyData,
            dayOfWeekDist,
            fieldCompleteness,
            avgWordsPerDay,
            avgResourcesPerWeek,
            topQualityWords,
            counts: {
                withExamples,
                withSynonyms,
                withAntonyms,
                withPronunciation,
                withExplanation,
                withRelatedWords,
                verbsWithForms,
                totalVerbs
            }
        };
    }, [vocabularies, resources, timeRange, userRoles]);

    const isLoading = isLoadingVocabs || isLoadingResources || isLoadingUsers;

    // Export functionality
    const handleExport = (exportFormat: 'csv' | 'json') => {
        const exportData = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalVocabulary: stats.totalWords,
                totalResources: stats.totalResources,
                activeUsers: stats.activeUsers,
                overallQuality: stats.qualityScores.overall,
                avgWordsPerDay: stats.avgWordsPerDay,
                avgResourcesPerWeek: stats.avgResourcesPerWeek
            },
            qualityMetrics: stats.qualityScores,
            fieldCompleteness: stats.fieldCompleteness,
            partOfSpeechDistribution: stats.pieData,
            topQualityWords: stats.topQualityWords.map((w: any) => ({
                english: w.english,
                bangla: w.bangla,
                partOfSpeech: w.partOfSpeech,
                qualityScore: w.qualityScore
            }))
        };

        const dateStr = format(new Date(), 'yyyy-MM-dd');

        if (exportFormat === 'json') {
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${dateStr}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Analytics exported as JSON');
        } else if (exportFormat === 'csv') {
            const csvRows = [
                ['Metric', 'Value'],
                ['Total Vocabulary', stats.totalWords],
                ['Total Resources', stats.totalResources],
                ['Active Users', stats.activeUsers],
                ['Overall Quality', `${stats.qualityScores.overall}%`],
                ['Avg Words/Day', stats.avgWordsPerDay],
                ['Avg Resources/Week', stats.avgResourcesPerWeek],
                [''],
                ['Field Completeness', 'Score'],
                ...stats.fieldCompleteness.map((f: any) => [f.field, `${f.score}%`])
            ];
            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Analytics exported as CSV');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-background/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Comprehensive system insights and performance metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refresh()}
                        disabled={isRefetching}
                        className={cn("transition-all", isRefetching ? "animate-pulse" : "")}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isRefetching ? "animate-spin" : "")} />
                        {isRefetching ? "Syncing..." : "Sync Data"}
                    </Button>
                    <div className="relative group">
                        <Button variant="default" size="sm" className="gap-2">
                            <FileDown className="h-4 w-4" />
                            Export
                        </Button>
                        <div className="absolute right-0 mt-2 w-40 bg-popover border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="p-1">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
                                >
                                    <FileText className="h-3 w-3" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => handleExport('json')}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
                                >
                                    <Database className="h-3 w-3" />
                                    Export as JSON
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="users">User Activity</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="content">Quality</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Hero Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="IELTS Tests"
                            value={ieltsStats.totalTests.toString()}
                            icon={Headphones}
                            trend="Active"
                            color="text-red-500"
                            bgColor="bg-red-50 dark:bg-red-950/20"
                        />
                        <StatCard
                            title="Total Vocabulary"
                            value={stats?.totalWords.toLocaleString() || '0'}
                            icon={BookOpen}
                            trend={`+${stats?.wordsAddedToday || 0} today`}
                            trendUp={true}
                            color="text-blue-500"
                            bgColor="bg-blue-50 dark:bg-blue-950/20"
                        />
                        <StatCard
                            title="Total Resources"
                            value={stats?.totalResources.toLocaleString() || '0'}
                            icon={ImageIcon}
                            trend={`+${stats?.resourcesAddedToday || 0} today`}
                            color="text-purple-500"
                            bgColor="bg-purple-50 dark:bg-purple-950/20"
                        />
                        <StatCard
                            title="Active Contributors"
                            value={stats?.activeUsers.toString() || '0'}
                            icon={Users}
                            subtext="Unique users"
                            color="text-green-500"
                            bgColor="bg-green-50 dark:bg-green-950/20"
                        />
                        <StatCard
                            title="Content Velocity"
                            value={`${stats?.avgWordsPerDay || 0}/day`}
                            icon={Zap}
                            subtext={`${stats?.avgResourcesPerWeek || 0} res/week`}
                            color="text-orange-500"
                            bgColor="bg-orange-50 dark:bg-orange-950/20"
                        />
                        <StatCard
                            title="Data Quality"
                            value={`${stats?.qualityScores.overall}%`}
                            icon={Award}
                            subtext="Overall completeness"
                            color="text-pink-500"
                            bgColor="bg-pink-50 dark:bg-pink-950/20"
                        />
                        <StatCard
                            title="System Health"
                            value="Excellent"
                            icon={Activity}
                            subtext={`${stats?.totalWords + stats?.totalResources} items`}
                            color="text-teal-500"
                            bgColor="bg-teal-50 dark:bg-teal-950/20"
                        />
                    </div>
                    {/* User Role Statistics */}
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                User Statistics
                            </CardTitle>
                            <CardDescription>Registered users and role distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalUsers || 0}</p>
                                    </div>
                                    <Users className="h-10 w-10 text-blue-500 opacity-50" />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.adminUsers || 0}</p>
                                    </div>
                                    <Award className="h-10 w-10 text-purple-500 opacity-50" />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Normal Users</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.normalUsers || 0}</p>
                                    </div>
                                    <User className="h-10 w-10 text-green-500 opacity-50" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-7">
                        {/* Quick Growth Chart */}
                        <Card className="md:col-span-4 shadow-md">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Content Growth</CardTitle>
                                    <div className="flex gap-1">
                                        <Button variant={timeRange === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('week')}>7d</Button>
                                        <Button variant={timeRange === 'month' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('month')}>30d</Button>
                                    </div>
                                </div>
                                <CardDescription>Words and Resources added over time</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats?.growthData}>
                                            <defs>
                                                <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorResources" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="words" name="Vocabulary" stroke="#8884d8" fillOpacity={1} fill="url(#colorWords)" />
                                            <Area type="monotone" dataKey="resources" name="Resources" stroke="#82ca9d" fillOpacity={1} fill="url(#colorResources)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity List */}
                        <Card className="md:col-span-3 shadow-md flex flex-col">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest system updates</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto pr-2">
                                <div className="space-y-4">
                                    {stats?.recentActivity.map((item: any, i: number) => (
                                        <div key={item.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110",
                                                    item.type === 'resource' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {item.type === 'resource' ? <ImageIcon className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm truncate max-w-[120px]">{item.english}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {item.type === 'resource' ? 'Resource' : item.partOfSpeech}
                                                        {item.type === 'vocabulary' && (
                                                            <span className="ml-1 opacity-70"> • {item.bangla}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {safeDate(item.createdAt) ? format(safeDate(item.createdAt)!, 'MMM d, h:mm a') : 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                </TabsContent>

                {/* ANALYTICS TAB */}
                <TabsContent value="analytics" className="space-y-6">
                    {/* Activity Heatmap */}
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                Contribution Heatmap
                            </CardTitle>
                            <CardDescription>Daily activity intensity over the last year</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                                {stats?.heatmapData.map((day, i) => (
                                    <Tooltip key={i} content={`${day.count} items on ${format(day.date, 'MMM do, yyyy')}`}>
                                        <div
                                            className={cn(
                                                "w-3 h-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-primary/50",
                                                day.count === 0 ? "bg-muted" :
                                                    day.count < 2 ? "bg-green-200 dark:bg-green-900/40" :
                                                        day.count < 5 ? "bg-green-400 dark:bg-green-700/60" :
                                                            "bg-green-600 dark:bg-green-500"
                                            )}
                                        />
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Day of Week Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Habits</CardTitle>
                                <CardDescription>Activity by day of the week</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.dayOfWeekDist}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--muted))' }}
                                                contentStyle={{ borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hourly Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Peak Hours</CardTitle>
                                <CardDescription>Activity time distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.hourlyData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--muted))' }}
                                                contentStyle={{ borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* POS Distribution Full */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vocabulary Breakdown</CardTitle>
                            <CardDescription>Distribution by Part of Speech</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-center justify-around">
                            <div className="h-[300px] w-full sm:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {stats?.pieData.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full sm:w-1/3 grid grid-cols-2 gap-4">
                                {stats?.pieData.map((entry: any, index: number) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{entry.name}</span>
                                            <span className="text-xs text-muted-foreground">{entry.value} words</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* USER ACTIVITY TAB */}
                <TabsContent value="users" className="space-y-6">
                    <UserActivityTab />
                </TabsContent>

                {/* INSIGHTS TAB */}
                <TabsContent value="insights" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Field Completeness Radar */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Field Completeness Analysis
                                </CardTitle>
                                <CardDescription>Data quality across all vocabulary fields</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={stats?.fieldCompleteness}>
                                            <PolarGrid stroke="hsl(var(--border))" />
                                            <PolarAngleAxis dataKey="field" fontSize={11} />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                                            <Radar name="Completeness" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Quality Words */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-yellow-500" />
                                    Top Quality Vocabulary
                                </CardTitle>
                                <CardDescription>Most complete vocabulary entries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {stats?.topQualityWords.slice(0, 8).map((word: any, i: number) => (
                                        <motion.div
                                            key={word.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{word.english}</p>
                                                    <p className="text-xs text-muted-foreground">{word.bangla}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">{word.partOfSpeech}</Badge>
                                                <div className="flex items-center gap-1">
                                                    <Award className="h-3 w-3 text-yellow-500" />
                                                    <span className="text-xs font-bold">{word.qualityScore}/7</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Quality Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5" />
                                Detailed Quality Breakdown
                            </CardTitle>
                            <CardDescription>Field-by-field completeness statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <QualityMetricCard
                                    title="Examples"
                                    score={stats?.qualityScores.examples || 0}
                                    count={stats?.counts.withExamples || 0}
                                    total={stats?.totalWords || 0}
                                    icon={FileText}
                                    color="text-blue-500"
                                />
                                <QualityMetricCard
                                    title="Synonyms"
                                    score={stats?.qualityScores.synonyms || 0}
                                    count={stats?.counts.withSynonyms || 0}
                                    total={stats?.totalWords || 0}
                                    icon={Type}
                                    color="text-green-500"
                                />
                                <QualityMetricCard
                                    title="Antonyms"
                                    score={stats?.qualityScores.antonyms || 0}
                                    count={stats?.counts.withAntonyms || 0}
                                    total={stats?.totalWords || 0}
                                    icon={Type}
                                    color="text-red-500"
                                />
                                <QualityMetricCard
                                    title="Pronunciation"
                                    score={stats?.qualityScores.pronunciation || 0}
                                    count={stats?.counts.withPronunciation || 0}
                                    total={stats?.totalWords || 0}
                                    icon={Activity}
                                    color="text-purple-500"
                                />
                                <QualityMetricCard
                                    title="Explanation"
                                    score={stats?.qualityScores.explanation || 0}
                                    count={stats?.counts.withExplanation || 0}
                                    total={stats?.totalWords || 0}
                                    icon={BookOpen}
                                    color="text-orange-500"
                                />
                                <QualityMetricCard
                                    title="Related Words"
                                    score={stats?.qualityScores.relatedWords || 0}
                                    count={stats?.counts.withRelatedWords || 0}
                                    total={stats?.totalWords || 0}
                                    icon={TrendingUp}
                                    color="text-teal-500"
                                />
                            </div>
                            {stats?.counts.totalVerbs > 0 && (
                                <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-indigo-500" />
                                            <span className="font-semibold text-sm">Verb Forms</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">
                                                {stats?.counts.verbsWithForms} / {stats?.counts.totalVerbs} verbs
                                            </span>
                                            <Badge variant={stats?.qualityScores.verbForms >= 80 ? "default" : "secondary"}>
                                                {stats?.qualityScores.verbForms}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress value={stats?.qualityScores.verbForms} className="h-2 mt-2" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONTENT HEALTH TAB (Renamed from Quality) */}
                <TabsContent value="content" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <QualityCard
                            title="Example Usage"
                            score={stats?.qualityScores.examples || 0}
                            icon={FileText}
                            description={`${stats?.counts.withExamples} words have example sentences`}
                            color="bg-green-500"
                        />
                        <QualityCard
                            title="Synonyms & Antonyms"
                            score={stats?.qualityScores.synonyms || 0}
                            icon={Type}
                            description={`${stats?.counts.withSynonyms} words have related terms`}
                            color="bg-purple-500"
                        />
                    </div>

                    <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                <AlertCircle className="h-5 w-5" />
                                <CardTitle>Content Improvements</CardTitle>
                            </div>
                            <CardDescription>Actionable insights to improve your database</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                {stats?.qualityScores.examples < 90 && (
                                    <li className="flex items-center gap-2 opacity-80">
                                        • Add example sentences to <strong>{(stats?.totalWords || 0) - (stats?.counts.withExamples || 0)}</strong> words to improve context.
                                    </li>
                                )}
                                <li className="flex items-center gap-2 opacity-80">
                                    • Review <strong>Uncategorized</strong> items to ensure better searching.
                                </li>
                                <li className="flex items-center gap-2 opacity-80">
                                    • Check for <strong>Duplicate</strong> entries in the tools section.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                </TabsContent>
            </Tabs>
        </div>
    );
}
