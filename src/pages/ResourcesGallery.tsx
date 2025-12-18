import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useResourcesSimple } from "@/hooks/useResources";
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
  Calendar
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

import { useVirtualizer } from "@tanstack/react-virtual";
import { cleanTextContent } from "@/utils/textCleaner";

export default function ResourcesGallery() {
  const navigate = useNavigate();

  // Use Dexie-backed resources with 15-minute cache
  const { data: images = [], isLoading: loading } = useResourcesSimple();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Virtual scrolling ref
  const parentRef = useRef<HTMLDivElement>(null);

  const clearFilters = () => {
    setSortBy("newest");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

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
      const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (img.description && img.description.toLowerCase().includes(searchQuery.toLowerCase()));
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

  // Virtual scrolling for grid (3 columns)
  const COLUMNS = 3;
  const rowCount = Math.ceil(filteredAndSortedImages.length / COLUMNS);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420, // Estimated row height
    overscan: 2,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
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

      <div className="max-w-6xl mx-auto px-4">
        {/* Search and Filter Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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

        {/* Resources Grid with Virtual Scrolling */}
        <div ref={parentRef} className="pb-8" style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
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
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * COLUMNS;
                const rowItems = filteredAndSortedImages.slice(startIndex, startIndex + COLUMNS);

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
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                      {rowItems.map((img, colIndex) => {
                        return (
                          <motion.div
                            key={img.id}
                            onClick={() => navigate(`/resources/${img.id}`)}
                          >
                            <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group border-0 bg-card/50 backdrop-blur-sm relative">
                              <div className="relative aspect-video overflow-hidden bg-muted/30 flex items-center justify-center">
                                {img.imageUrl ? (
                                  <>
                                    <img
                                      src={img.thumbnailUrl || img.imageUrl}
                                      alt={img.title}
                                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-blue-500/20 group-hover:scale-105 transition-transform duration-500">
                                    <GraduationCap className="h-12 w-12 text-primary/40" />
                                  </div>
                                )}
                              </div>

                              <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                  {img.title}
                                </h3>
                                <div className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                  {(() => {
                                    if (!img.description) return "Explore this resource in detail...";
                                    // Basic check to see if it's HTML (from rich text editor)
                                    const isHtml = /<[a-z][\s\S]*>/i.test(img.description);
                                    if (isHtml) {
                                      // Create a temporary element to strip HTML tags for preview
                                      const tmp = document.createElement("DIV");
                                      tmp.innerHTML = img.description;
                                      return (tmp.textContent || tmp.innerText || "").slice(0, 100) + "...";
                                    } else {
                                      // It's likely markdown or plain text
                                      return cleanTextContent(img.description).slice(0, 100) + '...';
                                    }
                                  })()}
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-2 border-t">
                                  <div className="text-primary text-sm font-medium flex items-center">
                                    Read Article <ZoomIn className="ml-2 h-4 w-4" />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(img.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
