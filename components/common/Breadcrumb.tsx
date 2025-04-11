"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  className?: string;
};

export default function Breadcrumb({
  items,
  showHome = true,
  homeHref = "/",
  className = "",
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: "Accueil", href: homeHref }, ...items]
    : items;

  return (
    <nav
      className={`flex items-center text-sm text-muted-foreground ${className}`}
      aria-label="Fil d'Ariane"
    >
      <ol className="flex flex-wrap items-center gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight size={14} className="mx-1 text-muted-foreground/50" />
              )}

              {index === 0 && showHome && (
                <Home size={14} className="mr-1" />
              )}

              {item.isCurrentPage || !item.href ? (
                <span 
                  className={`${isLast ? "font-medium text-foreground" : ""}`}
                  aria-current={item.isCurrentPage ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 