import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Check,
  X,
  Loader2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchMyProfile, updateMyProfile } from '@/api/users.api';
import { useAuthStore } from '@/store/auth.store';
import { AnimatedPage } from '@/components/shared/AnimatedPage';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { formatDate, getInitials } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 0',
        borderBottom: '1px solid hsl(240 10% 16%)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'hsl(265 80% 60% / 0.12)',
          border: '1px solid hsl(265 80% 60% / 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} style={{ color: 'hsl(265 80% 65%)' }} />
      </div>
      <div>
        <p style={{ fontSize: '0.72rem', color: 'hsl(240 5% 50%)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 2 }}>{value}</p>
      </div>
    </motion.div>
  );
}

export function ProfilePage() {
  const { user: authUser, setAuth, accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile?.name ?? authUser?.name },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => updateMyProfile(data),
    onSuccess: (updatedUser) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      // Update auth store
      if (authUser && accessToken) {
        setAuth({ ...authUser, name: updatedUser.name }, accessToken);
      }
      toast.success('Profile updated! ✨');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const displayUser = profile ?? authUser;

  return (
    <AnimatedPage>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 4, height: 24, borderRadius: 4, background: 'linear-gradient(180deg, hsl(265 80% 60%), hsl(230 70% 55%))' }} />
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800 }}>My Profile</h1>
        </div>
        <p style={{ color: 'hsl(240 5% 55%)', fontSize: '0.88rem', marginLeft: 16 }}>
          Manage your personal information and account settings
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
          <div className="shimmer rounded-2xl" style={{ height: 420 }} />
          <div className="shimmer rounded-2xl" style={{ height: 420 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
          {/* Left: Avatar Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl overflow-hidden"
              style={{ position: 'relative' }}
            >
              {/* Banner with background image */}
              <div
                style={{
                  height: 120,
                  backgroundImage: `url('https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?w=600&q=60')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, hsl(265 80% 60% / 0.6), hsl(230 70% 55% / 0.6))',
                  }}
                />
              </div>

              {/* Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 28px', position: 'relative' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(280 100% 70%))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: 'white',
                    fontFamily: 'Outfit, sans-serif',
                    marginTop: -44,
                    border: '4px solid hsl(240 10% 10%)',
                    boxShadow: '0 0 30px hsl(265 80% 60% / 0.5)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {displayUser ? getInitials(displayUser.name) : 'U'}
                </motion.div>

                <h2
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginTop: 12,
                    marginBottom: 4,
                    textAlign: 'center',
                  }}
                >
                  {displayUser?.name}
                </h2>

                <p style={{ fontSize: '0.82rem', color: 'hsl(240 5% 50%)', marginBottom: 12, textAlign: 'center' }}>
                  {displayUser?.email}
                </p>

                {displayUser && <RoleBadge role={displayUser.role} size="md" />}

                {/* Status */}
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 9999,
                    background: 'hsl(142 70% 45% / 0.12)',
                    border: '1px solid hsl(142 70% 45% / 0.25)',
                  }}
                >
                  <span
                    style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(142 70% 45%)', display: 'inline-block', boxShadow: '0 0 8px hsl(142 70% 45%)' }}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'hsl(142 70% 55%)', textTransform: 'capitalize' }}>
                    {displayUser?.status}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Account meta */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-5"
            >
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', marginBottom: 16, color: 'hsl(240 5% 70%)' }}>
                Account Meta
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Calendar size={14} style={{ color: 'hsl(265 80% 60%)' }} />
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'hsl(240 5% 50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{displayUser?.createdAt ? formatDate(displayUser.createdAt) : 'N/A'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={14} style={{ color: 'hsl(230 70% 55%)' }} />
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'hsl(240 5% 50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{displayUser?.updatedAt ? formatDate(displayUser.updatedAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Edit Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-8"
            style={{ height: 'fit-content' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
                  Account Information
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'hsl(240 5% 55%)' }}>
                  {isEditing ? 'Edit your details below' : 'Your current account details'}
                </p>
              </div>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.button
                    key="edit"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      reset({ name: displayUser?.name });
                      setIsEditing(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: 'hsl(265 80% 60% / 0.15)',
                      border: '1px solid hsl(265 80% 60% / 0.3)',
                      color: 'hsl(265 80% 70%)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} /> Edit Profile
                  </motion.button>
                ) : (
                  <motion.button
                    key="cancel"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: 'hsl(240 8% 18%)',
                      border: '1px solid hsl(240 10% 26%)',
                      color: 'hsl(240 5% 60%)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} /> Cancel
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit((data) => mutation.mutate(data))}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'hsl(240 5% 70%)', marginBottom: 8 }}>
                      Full Name
                    </label>
                    <input
                      {...register('name')}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'hsl(240 8% 12%)',
                        border: `1px solid ${errors.name ? 'hsl(0 72% 51%)' : 'hsl(265 80% 60%)'}`,
                        borderRadius: 12,
                        color: 'hsl(240 5% 96%)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        boxShadow: `0 0 0 3px hsl(265 80% 60% / 0.1)`,
                      }}
                    />
                    {errors.name && <p style={{ marginTop: 6, fontSize: '0.75rem', color: 'hsl(0 72% 60%)' }}>{errors.name.message}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'hsl(240 5% 70%)', marginBottom: 8 }}>
                      Email (read-only)
                    </label>
                    <input
                      value={displayUser?.email ?? ''}
                      disabled
                      style={{ width: '100%', padding: '12px 16px', background: 'hsl(240 8% 9%)', border: '1px solid hsl(240 10% 18%)', borderRadius: 12, color: 'hsl(240 5% 45%)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={mutation.isPending}
                    whileHover={{ scale: mutation.isPending ? 1 : 1.02, boxShadow: '0 8px 30px hsl(265 80% 60% / 0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
                      border: 'none',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 20px hsl(265 80% 60% / 0.25)',
                    }}
                  >
                    {mutation.isPending ? (
                      <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                    ) : (
                      <><Check size={16} /> Save Changes</>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <InfoRow icon={UserIcon} label="Full Name" value={displayUser?.name ?? ''} />
                  <InfoRow icon={Mail} label="Email Address" value={displayUser?.email ?? ''} />
                  <InfoRow icon={Shield} label="Role" value={displayUser?.role ? displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1) : ''} />
                  <InfoRow icon={Calendar} label="Account Created" value={displayUser?.createdAt ? formatDate(displayUser.createdAt) : 'N/A'} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AnimatedPage>
  );
}
