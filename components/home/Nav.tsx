'use client';

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const navItems = [
    { name: "صفحه اصلی", href: "/" },
    {
        name: "آموزش‌ها",
        href: "/tutorials",
        submenu: [
            { name: "جاواسکریپت", href: "/tutorials/javascript" },
            { name: "ری‌اکت", href: "/tutorials/react" },
            { name: "نکست‌جی‌اس", href: "/tutorials/nextjs" },
            { name: "تایپ‌اسکریپت", href: "/tutorials/typescript" },
        ]
    },
    { name: "مسیرهای یادگیری", href: "/learning-paths" },
    { name: "منابع", href: "#" },
];

export default function Nav({ isMobile = false }) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    if (isMobile) {
        return (
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <div key={item.href}>
                        <button
                            onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                            className="w-full flex items-center justify-between py-2 px-3 text-foreground hover:text-primary hover:bg-card rounded-lg transition-all font-medium"
                        >
                            {item.name}
                            {item.submenu && (
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`}
                                />
                            )}
                        </button>
                        {item.submenu && openSubmenu === item.name && (
                            <div className="ml-3 mt-2 flex flex-col gap-2 border-l border-border pl-3">
                                {item.submenu.map((subitem) => (
                                    <Link
                                        key={subitem.href}
                                        href={subitem.href}
                                        className="py-1.5 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-card rounded transition-all"
                                    >
                                        {subitem.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        );
    }

    return (
        <nav className="flex items-center gap-1">
            {navItems.map((item) => (
                <div key={item.href} className="relative group">
                    <Link
                        href={item.href}
                        className="flex items-center gap-1 px-4 py-2 text-foreground font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all group-hover:after:w-full"
                    >
                        {item.name}
                        {item.submenu && <ChevronDown size={16} />}
                    </Link>

                    {/* Dropdown Menu */}
                    {item.submenu && (
                        <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                            {item.submenu.map((subitem) => (
                                <Link
                                    key={subitem.href}
                                    href={subitem.href}
                                    className="block px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-all first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {subitem.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}