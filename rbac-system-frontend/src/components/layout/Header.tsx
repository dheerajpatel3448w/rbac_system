import { motion } from 'framer-motion';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { getInitials } from '@/lib/utils';
import { RoleBadge } from '@/components/shared/RoleBadge';

export function Header() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header
      style={{
        height: 64,
        borderBottom: '1px solid hsl(240 10% 16%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'hsl(240 10% 7% / 0.8)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Mobile menu + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'hsl(240 8% 14%)',
            border: '1px solid hsl(240 10% 20%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Menu size={18} style={{ color: 'hsl(240 5% 60%)' }} />
        </motion.button>

        {/* Search bar */}
        <motion.div
          initial={false}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'hsl(240 8% 12%)',
            border: '1px solid hsl(240 10% 20%)',
            borderRadius: 10,
            padding: '0 12px',
            height: 36,
            width: 240,
          }}
        >
          <Search size={15} style={{ color: 'hsl(240 5% 50%)' }} />
          <input
            placeholder="Search..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'hsl(240 5% 80%)',
              fontSize: '0.85rem',
              width: '100%',
            }}
          />
        </motion.div>
      </div>

      {/* Right: Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'hsl(240 8% 14%)',
            border: '1px solid hsl(240 10% 20%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bell size={18} style={{ color: 'hsl(240 5% 60%)' }} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'hsl(265 80% 60%)',
              boxShadow: '0 0 6px hsl(265 80% 60%)',
            }}
          />
        </motion.button>

        {/* User chip */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 14px 6px 6px',
            borderRadius: 12,
            background: 'hsl(240 8% 14%)',
            border: '1px solid hsl(240 10% 20%)',
            cursor: 'pointer',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 0 10px hsl(265 80% 60% / 0.4)',
            }}
          >
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</p>
            <div style={{ marginTop: 2 }}>
              {user && <RoleBadge role={user.role} size="sm" />}
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
