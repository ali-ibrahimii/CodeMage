'use client';

import { Button } from "../ui/button";
import Nav from "./Nav";
import Link from "next/link";
import { Code2, Search, Menu, X, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <Code2 size={20} className="text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg text-foreground hidden sm:inline">DevTutorials</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Nav />
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:flex items-center flex-1 max-w-xs mx-8">
                        <div className="relative w-full">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search tutorials..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Side - Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-card rounded-lg transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon size={20} className="text-foreground hover:text-primary" />
                            ) : (
                                <Sun size={20} className="text-foreground hover:text-primary" />
                            )}
                        </button>

                        <button className="hidden sm:inline text-foreground hover:text-primary font-medium transition-colors">
                            Sign In
                        </button>
                        <Button className="hidden sm:inline bg-primary hover:bg-primary/90 text-primary-foreground">
                            Get Started Free
                        </Button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 hover:bg-card rounded-lg transition-colors"
                        >
                            {isOpen ? (
                                <X size={24} className="text-foreground" />
                            ) : (
                                <Menu size={24} className="text-foreground" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-6 border-t border-border animate-in fade-in slide-in-from-top-2">
                        <Nav isMobile />
                        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 py-2 px-3 text-foreground hover:text-primary hover:bg-card rounded-lg transition-all font-medium w-full"
                            >
                                {theme === 'light' ? (
                                    <>
                                        <Moon size={18} />
                                        Dark Mode
                                    </>
                                ) : (
                                    <>
                                        <Sun size={18} />
                                        Light Mode
                                    </>
                                )}
                            </button>
                            <button className="text-foreground hover:text-primary font-medium transition-colors text-left py-2">
                                Sign In
                            </button>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                Get Started Free
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}