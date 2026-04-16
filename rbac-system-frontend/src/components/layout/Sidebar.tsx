import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { logoutUser } from '@/api/auth.api';
import { toast } from 'sonner';

const navItems = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    roles: ['admin', 'manager', 'user'],
  },
  {
    to: '/users',
    icon: Users,
    label: 'User Management',
    roles: ['admin', 'manager'],
  },
  {
    to: '/profile',
    icon: UserCircle,
    label: 'My Profile',
    roles: ['admin', 'manager', 'user'],
  },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const filteredNav = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      /* ignore */
    } finally {
      queryClient.clear(); // Instantly clear cached profile/user data
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        background: 'hsl(240 10% 7%)',
        borderRight: '1px solid hsl(240 10% 16%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: '24px 16px',
          borderBottom: '1px solid hsl(240 10% 16%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 72,
        }}
      >
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 20px hsl(265 80% 60% / 0.4)',
          }}
        >
          <Shield size={22} color="white" />
        </motion.div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, hsl(265 80% 70%), hsl(280 100% 75%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                PurpleMerit
              </p>
              <p style={{ fontSize: '0.7rem', color: 'hsl(240 5% 50%)', whiteSpace: 'nowrap' }}>
                RBAC System
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredNav.map((item) => (
          <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  position: 'relative',
                  background: isActive ? 'hsl(265 80% 60% / 0.15)' : 'transparent',
                  border: isActive ? '1px solid hsl(265 80% 60% / 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 20,
                      borderRadius: '0 4px 4px 0',
                      background: 'hsl(265 80% 60%)',
                      boxShadow: '0 0 8px hsl(265 80% 60%)',
                    }}
                  />
                )}
                <item.icon
                  size={20}
                  style={{
                    color: isActive ? 'hsl(265 80% 70%)' : 'hsl(240 5% 55%)',
                    flexShrink: 0,
                  }}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'hsl(240 5% 96%)' : 'hsl(240 5% 60%)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 10px', borderTop: '1px solid hsl(240 10% 16%)' }}>
        <motion.button
          whileHover={{ x: 3, background: 'hsl(0 72% 51% / 0.1)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <LogOut size={20} style={{ color: 'hsl(0 72% 65%)', flexShrink: 0 }} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: '0.875rem', color: 'hsl(0 72% 65%)', whiteSpace: 'nowrap' }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Toggle button */}
      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          right: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'hsl(240 8% 14%)',
          border: '1px solid hsl(240 10% 22%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        {sidebarOpen ? (
          <ChevronLeft size={14} style={{ color: 'hsl(240 5% 60%)' }} />
        ) : (
          <ChevronRight size={14} style={{ color: 'hsl(240 5% 60%)' }} />
        )}
      </motion.button>
    </motion.aside>
  );
}
