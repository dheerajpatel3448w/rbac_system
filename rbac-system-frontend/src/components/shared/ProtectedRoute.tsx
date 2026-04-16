import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(0 72% 51% / 0.2)', border: '1px solid hsl(0 72% 51% / 0.4)' }}
            >
              <ShieldX size={40} style={{ color: 'hsl(0 72% 51%)' }} />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Access Denied
          </h1>
          <p style={{ color: 'hsl(240 5% 60%)' }} className="mb-6">
            You don't have permission to view this page. Contact your administrator.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{
              background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
              color: 'white',
            }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
