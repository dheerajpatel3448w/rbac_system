import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Floating particles
function Particle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        borderRadius: '50%',
        background: `hsl(${265 + Math.random() * 30} 80% ${60 + Math.random() * 20}%)`,
        pointerEvents: 'none',
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.8, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3 + Math.random() * 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
}));

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data.email, data.password);
      setAuth(response.user, response.accessToken);
      toast.success(`Welcome back, ${response.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'hsl(240 10% 4%)',
      }}
    >
      {/* Background image with overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.07,
        }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="orb"
        style={{
          width: 600,
          height: 600,
          background: 'hsl(265 80% 60%)',
          opacity: 0.12,
          top: '-15%',
          left: '-10%',
        }}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: 'hsl(230 70% 55%)',
          opacity: 0.1,
          bottom: '-10%',
          right: '-5%',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="orb"
        style={{
          width: 300,
          height: 300,
          background: 'hsl(280 100% 70%)',
          opacity: 0.08,
          top: '40%',
          right: '20%',
        }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} delay={p.delay} />
      ))}

      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(hsl(265 80% 60% / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(265 80% 60% / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        perspective={1200}
        glareEnable={true}
        glareMaxOpacity={0.08}
        glareColor="hsl(265 80% 80%)"
        glarePosition="all"
        style={{ borderRadius: 24 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="gradient-border"
          style={{
            width: 440,
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Inner gradient glow */}
          <div
            style={{
              position: 'absolute',
              top: -1,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, hsl(265 80% 60%), transparent)',
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}
          >
            <div
              className="pulse-ring"
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 0 30px hsl(265 80% 60% / 0.4)',
              }}
            >
              <Shield size={32} color="white" />
            </div>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.75rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, hsl(265 80% 75%), hsl(280 100% 80%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 4,
              }}
            >
              Welcome Back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'hsl(240 5% 55%)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={12} style={{ color: 'hsl(265 80% 60%)' }} />
              Sign in to PurpleMerit RBAC
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'hsl(240 5% 70%)', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'hsl(240 5% 50%)',
                  }}
                />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'hsl(240 8% 12%)',
                    border: `1px solid ${errors.email ? 'hsl(0 72% 51%)' : 'hsl(240 10% 22%)'}`,
                    borderRadius: 12,
                    color: 'hsl(240 5% 96%)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'hsl(265 80% 60%)';
                    e.target.style.boxShadow = '0 0 0 3px hsl(265 80% 60% / 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? 'hsl(0 72% 51%)' : 'hsl(240 10% 22%)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{ marginTop: 6, fontSize: '0.75rem', color: 'hsl(0 72% 60%)' }}
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'hsl(240 5% 70%)', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'hsl(240 5% 50%)',
                  }}
                />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 42px',
                    background: 'hsl(240 8% 12%)',
                    border: `1px solid ${errors.password ? 'hsl(0 72% 51%)' : 'hsl(240 10% 22%)'}`,
                    borderRadius: 12,
                    color: 'hsl(240 5% 96%)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'hsl(265 80% 60%)';
                    e.target.style.boxShadow = '0 0 0 3px hsl(265 80% 60% / 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? 'hsl(0 72% 51%)' : 'hsl(240 10% 22%)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'hsl(240 5% 50%)',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{ marginTop: 6, fontSize: '0.75rem', color: 'hsl(0 72% 60%)' }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: '0 8px 30px hsl(265 80% 60% / 0.4)' }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: isLoading
                    ? 'hsl(265 80% 50%)'
                    : 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 20px hsl(265 80% 60% / 0.3)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Sign In Securely
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'hsl(240 5% 45%)',
            }}
          >
            Protected by PurpleMerit RBAC ·{' '}
            <span style={{ color: 'hsl(265 80% 65%)' }}>Enterprise Security</span>
          </motion.p>
        </motion.div>
      </Tilt>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
