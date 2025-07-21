
"use client"

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

export function Pagination({ currentPage, totalPages, siblingCount = 1 }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const paginationRange = () => {
    // Logic to create pagination range with sibling count and ellipses
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return [];
  };

  const pages = paginationRange();
  
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center gap-1">
      <PaginationLink href={createPageURL(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </PaginationLink>
      
      <div className="hidden sm:flex items-center gap-1">
        {pages.map((page, index) =>
          typeof page === "string" ? (
            <PaginationEllipsis key={`ellipsis-${index}`} />
          ) : (
            <PaginationLink key={page} href={createPageURL(page)} isActive={currentPage === page}>
              {page}
            </PaginationLink>
          )
        )}
      </div>
      <div className="sm:hidden flex items-center justify-center text-sm font-medium px-4">
        Halaman {currentPage} dari {totalPages}
      </div>


      <PaginationLink href={createPageURL(currentPage + 1)} disabled={currentPage === totalPages}>
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  );
}

interface PaginationLinkProps extends React.ComponentProps<typeof Link>, VariantProps<typeof buttonVariants> {
  isActive?: boolean;
  disabled?: boolean;
}

function PaginationLink({ className, isActive, disabled, ...props }: PaginationLinkProps) {
  return (
    <Link
      aria-disabled={disabled}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "outline",
          size: "sm",
        }),
        "gap-1",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  );
}


function PaginationEllipsis() {
  return (
    <span className="flex h-9 w-9 items-center justify-center">
      <MoreHorizontal className="h-4 w-4" />
    </span>
  );
}
