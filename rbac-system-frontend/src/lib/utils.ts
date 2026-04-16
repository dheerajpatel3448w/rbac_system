import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'admin': return 'hsl(265 80% 60%)';
    case 'manager': return 'hsl(230 70% 55%)';
    default: return 'hsl(199 89% 48%)';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'hsl(142 70% 45%)';
    case 'suspended': return 'hsl(38 92% 50%)';
    default: return 'hsl(0 72% 51%)';
  }
}
