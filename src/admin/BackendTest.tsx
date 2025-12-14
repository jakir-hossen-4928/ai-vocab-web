import Papa from 'papaparse';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const VALID_POS = [
    "Noun",
    "Verb",
    "Adjective",
    "Adverb",
    "Preposition",
    "Conjunction",
    "Pronoun",
    "Interjection",
    "Phrase",
    "Idiom",
    "Phrasal Verb",
    "Linking Phrase"
];

const BackendTest = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    // Search State
    const [query, setQuery] = useState('');
    const [isRegex, setIsRegex] = useState(false);
    const [selectedPos, setSelectedPos] = useState<string>('');

    // Resource/User Search State
    const [resourceQuery, setResourceQuery] = useState('');
    const [userQuery, setUserQuery] = useState('');

    const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";

    const handleVocabularySearch = async () => {
        setLoading(true);
        try {
            // const token = await user?.getIdToken(); // Using TEST_TOKEN as requested
            const token = TEST_TOKEN;
            let url = `http://localhost:5000/api/vocabularies?search=${encodeURIComponent(query)}&searchMode=${isRegex ? 'regex' : 'partial'}`;

            if (selectedPos && selectedPos !== 'all') {
                url += `&partOfSpeech=${encodeURIComponent(selectedPos)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            setResults(data.data || []);
            toast.success(`Found ${data.data?.length || 0} results`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch vocabularies");
        } finally {
            setLoading(false);
        }
    };

    const handleResourceSearch = async () => {
        setLoading(true);
        try {
            const token = TEST_TOKEN;
            const url = `http://localhost:5000/api/resources?search=${encodeURIComponent(resourceQuery)}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            setResults(data.data || []);
            toast.success(`Found ${data.data?.length || 0} resources`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch resources");
        } finally {
            setLoading(false);
        }
    };

    const handleUserSearch = async () => {
        setLoading(true);
        try {
            const token = TEST_TOKEN;
            const url = `http://localhost:5000/api/users?search=${encodeURIComponent(userQuery)}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            setResults(data.data || []);
            toast.success(`Found ${data.data?.length || 0} users`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const [progress, setProgress] = useState(0);
    const [migrationStatus, setMigrationStatus] = useState("");

    const migrateInChunks = async (data: any[], endpoint: string, token: string, batchSize = 50) => {
        const total = data.length;
        if (total === 0) return;

        for (let i = 0; i < total; i += batchSize) {
            const chunk = data.slice(i, i + batchSize);
            const currentProgress = Math.round(((i + chunk.length) / total) * 100);

            setMigrationStatus(`Migrating ${endpoint.split('/').pop()}... (${i + chunk.length}/${total})`);

            await fetch(`http://localhost:5000/api/migration/${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(chunk)
            });

            // Small delay to prevent UI freezing and allow server to catch up
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    };

    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                console.log("Parsed CSV:", results.data);
                const vocabularies = results.data.map((row: any) => ({
                    // Map CSV columns to Vocabulary fields
                    english: row.english || "",
                    bangla: row.bangla || "",
                    partOfSpeech: row.partOfSpeech || "Unknown",
                    explanation: row.explanation || "",
                    pronunciation: row.pronunciation || "",
                    examples: row.examples ? (row.examples.startsWith('[') ? JSON.parse(row.examples) : [row.examples]) : [],
                    synonyms: row.synonyms ? row.synonyms.split(',').map((s: string) => s.trim()) : [],
                    antonyms: row.antonyms ? row.antonyms.split(',').map((s: string) => s.trim()) : [],
                    createdAt: new Date().toISOString(),
                    userId: 'bulk-import',
                }));

                if (vocabularies.length > 0) {
                    setLoading(true);
                    setMigrationStatus("Uploading CSV Data...");
                    setProgress(0);
                    try {
                        const token = TEST_TOKEN;
                        await migrateInChunks(vocabularies, 'vocabularies', token);
                        toast.success(`Successfully uploaded ${vocabularies.length} items from CSV`);
                        setMigrationStatus("CSV Upload Completed!");
                    } catch (error) {
                        console.error("CSV Upload Failed", error);
                        toast.error("CSV Upload Failed");
                        setMigrationStatus("Failed");
                    } finally {
                        setLoading(false);
                    }
                } else {
                    toast.error("No valid data found in CSV");
                }
            },
            error: (error: any) => {
                console.error("CSV Parsing Error:", error);
                toast.error("Failed to parse CSV file");
            }
        });
    };

    const handleMigration = async () => {
        setLoading(true);
        setProgress(0);
        setMigrationStatus("Starting...");
        const token = TEST_TOKEN;

        try {
            // 1. Vocabularies
            setMigrationStatus("Fetching Vocabularies...");
            const vocabSnapshot = await getDocs(collection(db, "vocabularies"));
            const vocabularies = vocabSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (vocabularies.length > 0) {
                await migrateInChunks(vocabularies, 'vocabularies', token);
                toast.success("Vocabularies migrated!");
            }
            setProgress(33);

            // 2. Resources
            setMigrationStatus("Fetching Resources...");
            let resourceSnapshot = await getDocs(collection(db, "resources"));
            if (resourceSnapshot.empty) {
                resourceSnapshot = await getDocs(collection(db, "grammar"));
            }
            const resources = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (resources.length > 0) {
                await migrateInChunks(resources, 'resources', token);
                toast.success("Resources migrated!");
            }
            setProgress(66);

            // 3. Users
            setMigrationStatus("Fetching Users...");
            const userSnapshot = await getDocs(collection(db, "user_roles"));
            const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (users.length > 0) {
                await migrateInChunks(users, 'users', token);
                toast.success("Users migrated!");
            }
            setProgress(100);
            setMigrationStatus("Migration Completed!");
            toast.success("All data migrated successfully!");

        } catch (error) {
            console.error("Migration Failed", error);
            toast.error("Migration Failed: " + (error instanceof Error ? error.message : String(error)));
            setMigrationStatus("Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Backend Search & Filter Test</CardTitle>
                    <CardDescription>
                        Test advanced search patterns, regex capabilities, and data migration tools.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="vocabulary" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                            <TabsTrigger value="resources">Resources</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                            <TabsTrigger value="migration">Migration</TabsTrigger>
                        </TabsList>

                        {/* Vocabulary Tab */}
                        <TabsContent value="vocabulary" className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>Search Query</Label>
                                    <Input
                                        placeholder="Search word, meaning, explanation..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-64 space-y-2">
                                    <Label>Part of Speech</Label>
                                    <Select value={selectedPos} onValueChange={setSelectedPos}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {VALID_POS.map(pos => (
                                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pb-2">
                                    <Switch id="regex-mode" checked={isRegex} onCheckedChange={setIsRegex} />
                                    <Label htmlFor="regex-mode">Regex Mode</Label>
                                </div>
                                <Button onClick={handleVocabularySearch} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Search'}
                                </Button>
                            </div>

                            {/* Results Table */}
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Word</TableHead>
                                            <TableHead>Meaning</TableHead>
                                            <TableHead>Part of Speech</TableHead>
                                            <TableHead>Explanation</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    No results found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            results.map((vocab: any) => (
                                                <TableRow key={vocab.id}>
                                                    <TableCell className="font-medium">{vocab.english}</TableCell>
                                                    <TableCell>{vocab.bangla}</TableCell>
                                                    <TableCell>{vocab.partOfSpeech}</TableCell>
                                                    <TableCell className="max-w-md truncate" title={vocab.explanation}>
                                                        {vocab.explanation}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        {/* Resources Tab */}
                        <TabsContent value="resources" className="space-y-4">
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Search resources..."
                                    value={resourceQuery}
                                    onChange={(e) => setResourceQuery(e.target.value)}
                                    className="max-w-md"
                                />
                                <Button onClick={handleResourceSearch} disabled={loading}>
                                    {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Search
                                </Button>
                            </div>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Created At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.length > 0 && results[0]?.title ? results.map((res: any) => (
                                            <TableRow key={res.id}>
                                                <TableCell>{res.title}</TableCell>
                                                <TableCell className="max-w-md truncate">{res.description}</TableCell>
                                                <TableCell>{new Date(res.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center h-24">No resource results (or switch tab to clear)</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        {/* Users Tab */}
                        <TabsContent value="users" className="space-y-4">
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Search users (email, name)..."
                                    value={userQuery}
                                    onChange={(e) => setUserQuery(e.target.value)}
                                    className="max-w-md"
                                />
                                <Button onClick={handleUserSearch} disabled={loading}>
                                    {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Search
                                </Button>
                            </div>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Display Name</TableHead>
                                            <TableHead>Role</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.length > 0 && results[0]?.email ? results.map((u: any) => (
                                            <TableRow key={u.id}>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>{u.displayName}</TableCell>
                                                <TableCell>{u.role}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center h-24">No user results (or switch tab to clear)</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        {/* Migration Tab - Placeholder */}
                        <TabsContent value="migration" className="space-y-4">
                            <div className="flex flex-col items-center justify-center p-8 space-y-4 border border-dashed rounded-lg">
                                <h3 className="text-lg font-semibold">Data Migration Tools</h3>
                                <p className="text-muted-foreground text-center">
                                    Migrate data from Firebase to PostgreSQL Database or Upload CSV.
                                </p>

                                {loading && (
                                    <div className="w-full max-w-md space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{migrationStatus}</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 items-center">
                                    <Button onClick={handleMigration} disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Start Firebase Migration'}
                                    </Button>

                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCsvUpload}
                                            className="hidden"
                                            id="csv-upload"
                                            disabled={loading}
                                        />
                                        <Button asChild disabled={loading} variant="outline">
                                            <label htmlFor="csv-upload" className="cursor-pointer">
                                                Upload CSV
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    CSV Format: english, bangla, partOfSpeech, explanation, pronunciation, examples (JSON array or string), synonyms (comma sep), antonyms (comma sep)
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default BackendTest;
