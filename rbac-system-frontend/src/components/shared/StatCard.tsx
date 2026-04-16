import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: { value: number; label: string };
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, color, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass rounded-2xl p-6 relative overflow-hidden"
      style={{ border: `1px solid ${color}22` }}
    >
      {/* Ambient glow in corner */}
      <div
        className="orb"
        style={{
          width: 100,
          height: 100,
          background: color,
          opacity: 0.06,
          top: -20,
          right: -20,
          filter: 'blur(40px)',
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p
            style={{
              color: 'hsl(240 5% 60%)',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {title}
          </p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1,
              color: color,
            }}
          >
            {value}
          </motion.p>
          {trend && (
            <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'hsl(142 70% 45%)' }}>
              ↑ {trend.value}% {trend.label}
            </p>
          )}
        </div>

        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `${color}18`,
            border: `1px solid ${color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={24} style={{ color }} />
        </motion.div>
      </div>
    </motion.div>
  );
}
