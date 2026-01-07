import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResourcesSimple } from "@/hooks/useResources";
import { useDebounce } from "@/hooks/useDebounce";
import { GrammarImage } from "@/types/grammar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Search,
  GraduationCap,
  ZoomIn,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  X,
  ArrowRight
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import { List, AutoSizer, WindowScroller, CellMeasurer, CellMeasurerCache } from "react-virtualized";
import { cleanTextContent, stripMarkdown } from "@/utils/textCleaner";
import { Helmet } from "react-helmet-async";
import { CachedImage } from "@/components/CachedImage";
import { ResourcePlaceholder } from "@/components/ResourcePlaceholder";

export default function ResourcesGallery() {
  const navigate = useNavigate();

  // Use Dexie-backed resources with 15-minute cache
  const { data: images = [], isLoading: loading } = useResourcesSimple();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">((searchParams.get("sort") as any) || "newest");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">((searchParams.get("date") as any) || "all");
  const [customStartDate, setCustomStartDate] = useState(searchParams.get("start") || "");
  const [customEndDate, setCustomEndDate] = useState(searchParams.get("end") || "");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Virtual scrolling ref
  const parentRef = useRef<HTMLDivElement>(null);

  const clearFilters = () => {
    setSortBy("newest");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSearchQuery("");
  };

  // Sync state with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");

    if (sortBy !== "newest") params.set("sort", sortBy);
    else params.delete("sort");

    if (dateFilter !== "all") params.set("date", dateFilter);
    else params.delete("date");

    if (dateFilter === "custom") {
      if (customStartDate) params.set("start", customStartDate);
      else params.delete("start");
      if (customEndDate) params.set("end", customEndDate);
      else params.delete("end");
    } else {
      params.delete("start");
      params.delete("end");
    }

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, sortBy, dateFilter, customStartDate, customEndDate, setSearchParams]);

  // Date filtering helper
  const isWithinDateRange = (createdAt: string) => {
    const itemDate = new Date(createdAt);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return itemDate >= today;

      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;

      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;

      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        } else if (customStartDate) {
          const start = new Date(customStartDate);
          return itemDate >= start;
        } else if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return itemDate <= end;
        }
        return true;

      default:
        return true;
    }
  };

  // Filter and sort logic
  const filteredAndSortedImages = images
    .filter((img) => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        img.title.toLowerCase().includes(searchLower) ||
        (img.description && img.description.toLowerCase().includes(searchLower));
      const matchesDate = isWithinDateRange(img.createdAt);
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  // react-virtualized Cache
  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 420,
  }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Educational Resources | Ai Vocab</title>
        <meta name="description" content="Browse our collection of English learning materials, grammar guides, and vocabulary resources." />
        <meta property="og:title" content="Educational Resources | Ai Vocab" />
        <meta property="og:description" content="High-quality English learning materials and resources." />
      </Helmet>
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12 rounded-b-[2rem] shadow-lg mb-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Resources Gallery</h1>
              <p className="text-primary-foreground/80 text-sm">
                Visual guides and articles for mastering English
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search and Filter Bar */}
        <div className="flex gap-3 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              (e.currentTarget.querySelector('input') as HTMLInputElement)?.blur();
            }}
            className="relative flex-1"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/70" />
            <Input
              placeholder="Search resources..."
              className="pl-9 pr-10 text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              enterKeyHint="search"
              type="search"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10 hover:bg-transparent text-foreground"
                onClick={(e) => {
                  setSearchQuery("");
                  (e.currentTarget.closest('.relative')?.querySelector('input') as HTMLInputElement)?.blur();
                }}
              >
                <X className="h-4 w-4 text-foreground" />
              </Button>
            )}
          </form>

          {/* Filter Sheet - Bottom Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh]">
              <SheetHeader>
                <SheetTitle>Filter & Sort Resources</SheetTitle>
                <SheetDescription>
                  Customize how resources are displayed
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                {/* Sort By */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">
                        <div className="flex items-center gap-2">
                          <SortDesc className="h-4 w-4" />
                          Newest First
                        </div>
                      </SelectItem>
                      <SelectItem value="oldest">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-4 w-4" />
                          Oldest First
                        </div>
                      </SelectItem>
                      <SelectItem value="title">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          A-Z
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Label>
                  <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Date Range */}
                {dateFilter === "custom" && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Results Count */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredAndSortedImages.length}</span> of <span className="font-semibold text-foreground">{images.length}</span> resources
                  </p>
                </div>
              </div>
              <SheetFooter className="gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear Filters
                </Button>
                <SheetClose asChild>
                  <Button className="flex-1">Apply</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="pb-32 md:pb-8">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredAndSortedImages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-12 text-center shadow-sm border-dashed">
                <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? "No matches found" : "Gallery Empty"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Check back soon for new content!"}
                </p>
              </Card>
            </motion.div>
          ) : (
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <AutoSizer disableHeight>
                  {({ width }) => {
                    const itemsPerRow = width < 640 ? 1 : width < 1024 ? 2 : 3;

                    // Clear cache if itemsPerRow changes to ensure correct cell measurement
                    if (parentRef.current && (parentRef.current as any)._lastItemsPerRow !== itemsPerRow) {
                      cache.current.clearAll();
                      (parentRef.current as any)._lastItemsPerRow = itemsPerRow;
                    }

                    const rowCount = Math.ceil(filteredAndSortedImages.length / itemsPerRow);

                    return (
                      <List
                        ref={parentRef as any}
                        autoHeight
                        height={height}
                        isScrolling={isScrolling}
                        onScroll={onChildScroll}
                        scrollTop={scrollTop}
                        width={width}
                        rowCount={rowCount}
                        rowHeight={cache.current.rowHeight}
                        deferredMeasurementCache={cache.current}
                        rowRenderer={({ index, key, parent, style }) => {
                          const startIndex = index * itemsPerRow;
                          const rowItems = filteredAndSortedImages.slice(startIndex, startIndex + itemsPerRow);

                          return (
                            <CellMeasurer
                              cache={cache.current}
                              columnIndex={0}
                              key={key}
                              parent={parent}
                              rowIndex={index}
                            >
                              {({ registerChild }) => (
                                <div
                                  ref={registerChild as any}
                                  style={style}
                                  className="pb-6"
                                >
                                  <div
                                    className="grid gap-4 sm:gap-6"
                                    style={{
                                      gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`
                                    }}
                                  >
                                    {rowItems.map((img: GrammarImage) => (
                                      <motion.div
                                        key={img.id}
                                        onClick={() => navigate(`/resources/${img.slug || img.id}`)}
                                      >
                                        <Card className="min-h-full flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 bg-white shadow-md relative rounded-2xl overflow-hidden">
                                          <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                            {img.imageUrl ? (
                                              <div className="w-full h-full relative">
                                                <CachedImage
                                                  src={img.thumbnailUrl || img.imageUrl}
                                                  alt=""
                                                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
                                                  loading="lazy"
                                                />
                                                <CachedImage
                                                  src={img.imageUrl}
                                                  alt={img.title}
                                                  className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                  loading="lazy"
                                                />
                                              </div>
                                            ) : (
                                              <ResourcePlaceholder title={img.title} />
                                            )}
                                          </div>

                                          <div className="flex-1 p-5 sm:p-6 flex flex-col">
                                            <h3 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                              {img.title}
                                            </h3>
                                            <p className="mb-6 text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-1">
                                              {(() => {
                                                if (!img.description) return "Explore this resource in detail...";
                                                const cleanText = stripMarkdown(img.description);
                                                return cleanText.length > 100 ? cleanText.slice(0, 100) + '...' : cleanText;
                                              })()}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between">
                                              <div className="inline-flex items-center text-muted-foreground bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-foreground shadow-sm font-medium leading-5 rounded-lg text-sm px-4 py-2.5 transition-all group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                                                Read more
                                                <ArrowRight className="w-4 h-4 ms-1.5 transition-transform group-hover:translate-x-1" />
                                              </div>
                                              <span className="text-[11px] font-medium text-muted-foreground/50">
                                                {new Date(img.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        </Card>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CellMeasurer>
                          );
                        }}
                      />
                    );
                  }}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
        </div>
      </div>
    </div>
  );
}
