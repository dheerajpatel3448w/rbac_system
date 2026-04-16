import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store/ui.store';

export function AppShell() {
  const { sidebarOpen } = useUIStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(240 10% 6%)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <motion.div
        animate={{ marginLeft: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Header />
        <main style={{ flex: 1, padding: '32px', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
