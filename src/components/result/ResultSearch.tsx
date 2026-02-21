'use client';

/**
 * ResultSearch - Search input component for ERN or Seat Number lookup
 */

import { useState, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { Search, X, Loader2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BRANCHES, DEFAULT_BRANCH } from '@/src/config/branches';

interface ResultSearchProps {
    onSearch: (query: string, branchId: string) => Promise<void>;
    onReset: () => void;
    isLoading: boolean;
    hasResult: boolean;
}

export function ResultSearch({ onSearch, onReset, isLoading, hasResult }: ResultSearchProps) {
    const [query, setQuery] = useState('');
    const [branch, setBranch] = useState(DEFAULT_BRANCH);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    }, []);

    const handleBranchChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setBranch(e.target.value);
    }, []);

    const handleSearch = useCallback(() => {
        if (query.trim() && !isLoading) {
            onSearch(query.trim(), branch);
        }
    }, [query, branch, isLoading, onSearch]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    const handleReset = useCallback(() => {
        setQuery('');
        // setBranch(DEFAULT_BRANCH); // Optionally reset branch
        onReset();
    }, [onReset]);

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Branch Selector */}
                <div className="relative min-w-[200px]">
                    <select
                        value={branch}
                        onChange={handleBranchChange}
                        className="w-full h-12 pl-3 pr-8 bg-background border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer text-foreground shadow-sm appearance-none"
                        disabled={isLoading}
                        style={{ backgroundImage: 'none' }} // Force remove default arrow on some browsers
                    >
                        {BRANCHES.map((b) => (
                            <option key={b.id} value={b.id} className="bg-background text-foreground py-2">
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Query Input */}
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                    <div className="relative bg-card border shadow-sm rounded-xl transition-shadow hover:shadow-md h-12">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                        <Input
                            type="text"
                            placeholder="Enter ERN or Seat Number"
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="pl-10 h-12 text-base bg-transparent border-0 ring-0 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50"
                            aria-label="ERN or Seat Number"
                        />
                        {hasResult && (
                            <button
                                onClick={handleReset}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    onClick={handleSearch}
                    disabled={!query.trim() || isLoading}
                    className="h-12 px-8 font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Wait...
                        </>
                    ) : (
                        'View Result'
                    )}
                </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground/80 text-center font-medium">
                Select your branch and enter ERN or Seat Number to view results
            </p>
        </div>
    );
}
