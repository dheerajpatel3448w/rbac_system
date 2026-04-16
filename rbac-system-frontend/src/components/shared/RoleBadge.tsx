import type { Role } from '@/types';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md';
}

const CONFIG: Record<Role, { label: string; bg: string; color: string; dot: string }> = {
  admin: {
    label: 'Admin',
    bg: 'hsl(265 80% 60% / 0.15)',
    color: 'hsl(265 80% 70%)',
    dot: 'hsl(265 80% 60%)',
  },
  manager: {
    label: 'Manager',
    bg: 'hsl(230 70% 55% / 0.15)',
    color: 'hsl(230 70% 70%)',
    dot: 'hsl(230 70% 55%)',
  },
  user: {
    label: 'User',
    bg: 'hsl(199 89% 48% / 0.15)',
    color: 'hsl(199 89% 65%)',
    dot: 'hsl(199 89% 48%)',
  },
};

export function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const cfg = CONFIG[role];
  const padding = size === 'md' ? '6px 14px' : '3px 10px';
  const fontSize = size === 'md' ? '0.8rem' : '0.7rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        borderRadius: '9999px',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.dot,
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: `0 0 6px ${cfg.dot}`,
        }}
      />
      {cfg.label}
    </span>
  );
}
