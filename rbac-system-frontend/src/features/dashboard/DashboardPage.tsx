import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Shield, Plus, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { fetchAllUsers } from '@/api/users.api';
import { AnimatedPage } from '@/components/shared/AnimatedPage';
import { StatCard } from '@/components/shared/StatCard';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { formatDate } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import type { User } from '@/types';

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ users }: { users: User[] }) {
  const navigate = useNavigate();

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    admins: users.filter((u) => u.role === 'admin').length,
    managers: users.filter((u) => u.role === 'manager').length,
    normalUsers: users.filter((u) => u.role === 'user').length,
  };

  const pieData = [
    { name: 'Admin', value: stats.admins, color: 'hsl(265 80% 60%)' },
    { name: 'Manager', value: stats.managers, color: 'hsl(230 70% 55%)' },
    { name: 'User', value: stats.normalUsers, color: 'hsl(199 89% 48%)' },
  ];

  const barData = [
    { name: 'Active', value: stats.active, fill: 'hsl(142 70% 45%)' },
    { name: 'Suspended', value: stats.suspended, fill: 'hsl(38 92% 50%)' },
    { name: 'Inactive', value: users.filter((u) => u.status === 'inactive').length, fill: 'hsl(0 72% 51%)' },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
        <StatCard title="Total Users" value={stats.total} icon={Users} color="hsl(265 80% 60%)" delay={0} />
        <StatCard title="Active Users" value={stats.active} icon={UserCheck} color="hsl(142 70% 45%)" delay={0.1} />
        <StatCard title="Suspended" value={stats.suspended} icon={UserX} color="hsl(38 92% 50%)" delay={0.2} />
        <StatCard title="Admins" value={stats.admins} icon={Shield} color="hsl(280 100% 70%)" delay={0.3} />
      </div>

      {/* Charts + Recent Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 20 }}>
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: 4 }}>Role Distribution</h3>
          <p style={{ fontSize: '0.78rem', color: 'hsl(240 5% 55%)', marginBottom: 16 }}>Users by role</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(240 8% 12%)',
                  border: '1px solid hsl(240 10% 22%)',
                  borderRadius: 8,
                  color: 'hsl(240 5% 96%)',
                  fontSize: '0.8rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pieData.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                  <span style={{ fontSize: '0.8rem', color: 'hsl(240 5% 65%)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: 4 }}>Status Overview</h3>
          <p style={{ fontSize: '0.78rem', color: 'hsl(240 5% 55%)', marginBottom: 16 }}>Users by status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(240 8% 12%)',
                  border: '1px solid hsl(240 10% 22%)',
                  borderRadius: 8,
                  color: 'hsl(240 5% 96%)',
                  fontSize: '0.8rem',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: 4 }}>Recent Users</h3>
              <p style={{ fontSize: '0.78rem', color: 'hsl(240 5% 55%)' }}>Latest additions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'hsl(265 80% 60% / 0.15)',
                border: '1px solid hsl(265 80% 60% / 0.3)',
                color: 'hsl(265 80% 70%)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View All <ArrowRight size={12} />
            </motion.button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentUsers.map((user, i) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px',
                  borderRadius: 10,
                  background: 'hsl(240 8% 12%)',
                  border: '1px solid hsl(240 10% 18%)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'hsl(240 5% 50%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                </div>
                <RoleBadge role={user.role} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-2xl p-6"
      >
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Create User', icon: Plus, color: 'hsl(265 80% 60%)', action: () => navigate('/users') },
            { label: 'View All Users', icon: Users, color: 'hsl(230 70% 55%)', action: () => navigate('/users') },
            { label: 'Activity Log', icon: Activity, color: 'hsl(142 70% 45%)', action: () => {} },
            { label: 'Analytics', icon: TrendingUp, color: 'hsl(38 92% 50%)', action: () => {} },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={action.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                background: `${action.color}15`,
                border: `1px solid ${action.color}30`,
                color: action.color,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <action.icon size={16} />
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────
function ManagerDashboard({ users }: { users: User[] }) {
  const navigate = useNavigate();
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
  };

  const barData = [
    { name: 'Active', value: stats.active, fill: 'hsl(142 70% 45%)' },
    { name: 'Suspended', value: stats.suspended, fill: 'hsl(38 92% 50%)' },
    { name: 'Inactive', value: users.filter((u) => u.status === 'inactive').length, fill: 'hsl(0 72% 51%)' },
  ];

  const recentUsers = [...users]
    .filter(u => u.role !== 'admin')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <StatCard title="Team Size" value={stats.total} icon={Users} color="hsl(230 70% 55%)" delay={0} />
        <StatCard title="Active Members" value={stats.active} icon={UserCheck} color="hsl(142 70% 45%)" delay={0.1} />
        <StatCard title="Suspended" value={stats.suspended} icon={UserX} color="hsl(38 92% 50%)" delay={0.2} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: 4 }}>Recent Members</h3>
              <p style={{ fontSize: '0.78rem', color: 'hsl(240 5% 55%)' }}>Newest additions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'hsl(230 70% 55% / 0.15)',
                border: '1px solid hsl(230 70% 55% / 0.3)',
                color: 'hsl(230 70% 65%)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Manage <ArrowRight size={12} />
            </motion.button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentUsers.map((user, i) => (
              <div
                key={user._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px',
                  borderRadius: 10,
                  background: 'hsl(240 8% 12%)',
                  border: '1px solid hsl(240 10% 18%)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'hsl(230 70% 55%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'hsl(240 5% 50%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                </div>
                <RoleBadge role={user.role} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: 4 }}>Team Status Overview</h3>
          <p style={{ fontSize: '0.78rem', color: 'hsl(240 5% 55%)', marginBottom: 16 }}>Users by status</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(240 8% 12%)',
                  border: '1px solid hsl(240 10% 22%)',
                  borderRadius: 8,
                  color: 'hsl(240 5% 96%)',
                  fontSize: '0.8rem',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

// ─── User Dashboard ───────────────────────────────────────────────────────────
function UserDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-border"
        style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=60')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.05,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.85rem', color: 'hsl(265 80% 70%)', fontWeight: 600, marginBottom: 8 }}>
            ✦ Welcome Back
          </p>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, hsl(240 5% 96%), hsl(265 80% 75%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 12,
            }}
          >
            {user?.name}
          </h2>
          <p style={{ color: 'hsl(240 5% 55%)', maxWidth: 500 }}>
            You're logged in as a standard user. View your profile and account details from the sidebar.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profile')}
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
              border: 'none',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            View My Profile <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuthStore();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const { data, isLoading } = useQuery({
    queryKey: ['users-dashboard'],
    queryFn: () => fetchAllUsers({ limit: 100 }),
    enabled: isAdminOrManager,
  });

  const users = data?.users ?? [];

  return (
    <AnimatedPage>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 4,
              height: 24,
              borderRadius: 4,
              background: 'linear-gradient(180deg, hsl(265 80% 60%), hsl(230 70% 55%))',
            }}
          />
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800 }}>
            Dashboard
          </h1>
        </div>
        <p style={{ color: 'hsl(240 5% 55%)', fontSize: '0.9rem', marginLeft: 16 }}>
          {user?.role === 'admin'
            ? 'Full system overview and management controls'
            : user?.role === 'manager'
            ? 'Team overview and user management'
            : 'Your personal workspace'}
        </p>
      </div>

      {isLoading && isAdminOrManager ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer rounded-2xl" style={{ height: 140 }} />
          ))}
        </div>
      ) : (
        <>
          {user?.role === 'admin' && <AdminDashboard users={users} />}
          {user?.role === 'manager' && <ManagerDashboard users={users} />}
          {user?.role === 'user' && <UserDashboard />}
        </>
      )}
    </AnimatedPage>
  );
}
