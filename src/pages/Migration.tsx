import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportVocabulariesToCSV, exportResourcesToCSV } from '@/services/exportService';

const MigrationPage = () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    const handleExport = async (type: 'vocab' | 'resource') => {
        try {
            if (type === 'vocab') {
                const count = await exportVocabulariesToCSV('');
                addLog(`Exported ${count} vocabularies to CSV.`);
            } else {
                const count = await exportResourcesToCSV('');
                addLog(`Exported ${count} resources to CSV.`);
            }
        } catch (error: any) {
            addLog(`Export failed: ${error.message}`);
        }
    };

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
                <p className="text-muted-foreground">Export Firebase data to Supabase-compatible CSVs.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>
                        Download data formatted for direct import into Supabase Dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex gap-4 flex-wrap">
                        <Button variant="outline" onClick={() => handleExport('vocab')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export Vocabularies
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('resource')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export Resources
                        </Button>
                    </div>

                    {logs.length > 0 && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm font-mono text-muted-foreground">
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MigrationPage;
