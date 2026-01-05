
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, ArrowRight, PlayCircle, BookOpen, Search, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { listeningService } from "@/services/listeningService";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ListeningTest } from "@/data/listeningData";

// Simple hook to get window width for responsive grid
function useWindowWidth() {
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}

const ListeningList = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const parentRef = useRef<HTMLDivElement>(null);
    const windowWidth = useWindowWidth();

    // Determine columns based on width
    const columns = useMemo(() => {
        if (windowWidth >= 1280) return 3; // xl
        if (windowWidth >= 768) return 2;  // md
        return 1;
    }, [windowWidth]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['listening-tests'],
        queryFn: async ({ pageParam = null }) => {
            const res = await listeningService.getTestsPaginated(pageParam, 20);
            return res;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
    });

    const allTests = useMemo(() =>
        data ? data.pages.flatMap((page) => page.tests) : []
        , [data]);

    // Client-side filtering (Note: Filtering works best with ALL data. 
    // Pagination + Client Filtering is tricky. If user searches, we ideally should Query Firestore with "where".
    // For now, if string is empty, we show paginated list. If string has value, we can't easily filter paginated data unless we search on server.
    // Given the "reduce cost" requirement, server search is better but requires simple index.
    // Let's implement Client Side Filtering only on the *fetched* data for now, 
    // OR switch to server search if query exists. 
    // Optimization: If search query exists, we might need a separate query. 
    // For simplicity given constraints: Filter loaded data. This has limitations (searches only what's loaded).
    // BETTER approach for cost: Use Firestore "where('title', '>=', query)" but that requires case-sensitiveexact matches or advanced indexes.
    // Compromise: Just filter loaded data. Warn user or load more? 
    // Actually, if search is active, we might want to disable infinite scroll and just show matches from what we have, or trigger a different search query.
    // Let's stick to filtering loaded data to satisfy "reduce cost" (no new search reads) but it might miss data.
    // Actually, widespread practice: If filtering, fetch from server.
    // Let's keep it simple: Filter only loaded data. User scrolls to load more.

    const filteredTests = useMemo(() => {
        if (!searchQuery) return allTests;
        return allTests.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allTests, searchQuery]);

    // Virtualizer
    const rowCount = Math.ceil(filteredTests.length / columns);

    const rowVirtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 220,
        overscan: 3,
    });

    // Infinite Scroll Trigger
    useEffect(() => {
        if (!searchQuery) { // Only auto-load more if not searching, to avoid weird UX
            const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
            if (!lastItem) return;

            if (
                lastItem.index >= rowCount - 1 &&
                hasNextPage &&
                !isFetchingNextPage
            ) {
                fetchNextPage();
            }
        }
    }, [
        hasNextPage,
        fetchNextPage,
        allTests.length,
        isFetchingNextPage,
        rowVirtualizer.getVirtualItems(),
        rowCount,
        searchQuery
    ]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-8 pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter text-foreground">
                        IELTS Listening
                    </h2>
                    <p className="text-muted-foreground font-medium text-lg">
                        Access your IELTS listening practice materials.
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search loaded tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>
            </div>

            {/* Test Grid / List */}
            {status === 'pending' ? (
                <div className="flex-1 -mx-2 px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-[200px] rounded-2xl border border-border/40 bg-card p-6 flex flex-col space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : status === 'error' ? (
                <div className="text-center py-20 text-destructive flex-1">
                    <p className="text-xl font-bold">Error loading tests</p>
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground flex-1">
                    <p className="text-xl font-bold">No tests found</p>
                    {searchQuery ? <p>Try adjusting your search query.</p> : <p>Library is empty.</p>}
                </div>
            ) : (
                <div
                    ref={parentRef}
                    className="flex-1 overflow-auto -mx-2 px-2 pb-10 scroll-smooth"
                    style={{ contain: 'strict' }}
                >
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const rowIndex = virtualRow.index;
                            const start = rowIndex * columns;
                            const rowItems = filteredTests.slice(start, start + columns);

                            return (
                                <div
                                    key={virtualRow.key}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6"
                                >
                                    {rowItems.map((test) => (
                                        <div
                                            key={test.id}
                                            className="group relative overflow-hidden rounded-2xl bg-card border border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer h-[200px]"
                                            onClick={() => navigate(`/ielts-listing/${test.id}`)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="p-6 flex flex-col h-full relative">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                        <Headphones className="h-6 w-6" />
                                                    </div>
                                                    <span className="px-2.5 py-1 rounded-full bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        Audio
                                                    </span>
                                                </div>

                                                <div className="space-y-2 flex-1 min-h-0">
                                                    <h3 className="text-xl font-bold tracking-tight text-card-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {test.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground/80">
                                                        <span className="flex items-center gap-1">
                                                            <BookOpen className="h-3.5 w-3.5" />
                                                            {test.sections?.length || 0} Parts
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <PlayCircle className="h-3.5 w-3.5" />
                                                            Ready
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm font-bold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mt-2">
                                                    Open File <ArrowRight className="h-3.5 w-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    {isFetchingNextPage && (
                        <div className="py-4 flex justify-center w-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ListeningList;
