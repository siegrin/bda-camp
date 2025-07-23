
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center flex-wrap space-x-2 text-sm text-muted-foreground', className)}>
      {items.map((item, index) => (
        <div key={item.name} className="flex items-center space-x-2 py-0.5">
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          <Link
            href={item.href}
            className={
              index === items.length - 1
                ? 'font-medium text-foreground'
                : 'hover:text-primary'
            }
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {item.name}
          </Link>
        </div>
      ))}
    </nav>
  );
}
