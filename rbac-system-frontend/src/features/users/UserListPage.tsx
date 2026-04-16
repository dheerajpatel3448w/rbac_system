import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  Plus, Search, Trash2, Edit3, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, X, Users, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchAllUsers, deleteUser, createUser, updateUser } from '@/api/users.api';
import { useAuthStore } from '@/store/auth.store';
import { AnimatedPage } from '@/components/shared/AnimatedPage';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { formatDate } from '@/lib/utils';
import type { User, Role, Status } from '@/types';

// ─── Global Styles ────────────────────────────────────────────────────────────
const spinKeyframes = `
  @keyframes my-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = spinKeyframes;
  document.head.appendChild(style);
}

// ─── Schemas ──────────────────────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'manager', 'user'] as const),
});

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'manager', 'user'] as const),
  status: z.enum(['active', 'suspended', 'inactive'] as const),
});

type CreateData = z.infer<typeof createSchema>;
type EditData = z.infer<typeof editSchema>;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const cfg = {
    active: { bg: 'hsl(142 70% 45% / 0.15)', color: 'hsl(142 70% 55%)', dot: 'hsl(142 70% 45%)' },
    suspended: { bg: 'hsl(38 92% 50% / 0.15)', color: 'hsl(38 92% 60%)', dot: 'hsl(38 92% 50%)' },
    inactive: { bg: 'hsl(0 72% 51% / 0.15)', color: 'hsl(0 72% 65%)', dot: 'hsl(0 72% 51%)' },
  }[status];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px',
      borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em',
      textTransform: 'uppercase', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.dot}33`
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: cfg.dot,
        display: 'inline-block', boxShadow: `0 0 6px ${cfg.dot}`
      }} />
      {status}
    </span>
  );
}

// ─── Overlay Modal (no Radix, no focus-trap issues) ───────────────────────────
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: 480, maxWidth: '95vw', background: 'hsl(240 8% 10%)',
          border: '1px solid hsl(265 80% 60% / 0.3)', borderRadius: 20,
          padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', position: 'relative'
        }}>
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.8rem', fontWeight: 500,
        color: 'hsl(240 5% 70%)', marginBottom: 6
      }}>{label}</label>
      {children}
      {error && <p style={{ marginTop: 4, fontSize: '0.75rem', color: 'hsl(0 72% 60%)' }}>{error}</p>}
    </div>
  );
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 14px',
  background: 'hsl(240 8% 12%)',
  border: `1px solid ${hasError ? 'hsl(0 72% 51%)' : 'hsl(240 10% 22%)'}`,
  borderRadius: 10, color: 'hsl(240 5% 96%)', fontSize: '0.875rem',
  outline: 'none', boxSizing: 'border-box',
});

// ─── Create User Modal ────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateData>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'user' },
  });

  const mut = useMutation({
    mutationFn: createUser,
    onSuccess: () => { toast.success('User created! ✨'); onSuccess(); onClose(); },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e?.response?.data?.message ?? 'Failed to create user'),
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800 }}>Create New User</h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(240 5% 55%)', marginTop: 4 }}>Add a new user to the system</p>
        </div>
        <button type="button" onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: '50%', background: 'hsl(240 8% 16%)',
            border: '1px solid hsl(240 10% 24%)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer'
          }}>
          <X size={16} style={{ color: 'hsl(240 5% 60%)' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit((d) => mut.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full Name" error={errors.name?.message}>
          <input {...register('name')} placeholder="John Doe" style={inputStyle(!!errors.name)} />
        </Field>
        <Field label="Email Address" error={errors.email?.message}>
          <input {...register('email')} type="email" placeholder="john@example.com" style={inputStyle(!!errors.email)} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input {...register('password')} type="password" placeholder="Min 8 characters" style={inputStyle(!!errors.password)} />
        </Field>
        <Field label="Role">
          <select {...register('role')} style={inputStyle()}>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, background: 'hsl(240 8% 16%)',
              border: '1px solid hsl(240 10% 24%)', color: 'hsl(240 5% 60%)', fontSize: '0.875rem',
              fontWeight: 600, cursor: 'pointer'
            }}>
            Cancel
          </button>
          <button type="submit" disabled={mut.isPending}
            style={{
              flex: 1, padding: '11px', borderRadius: 10,
              background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
              border: 'none', color: 'white', fontSize: '0.875rem', fontWeight: 700,
              cursor: mut.isPending ? 'not-allowed' : 'pointer', opacity: mut.isPending ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
            {mut.isPending ? <><Loader2 size={14} style={{ animation: 'my-spin 1s linear infinite' }} /> Creating...</> : 'Create User'}
          </button>
        </div>
      </form>
    </>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess, currentUserRole }: { user: User; onClose: () => void; onSuccess: () => void; currentUserRole: string }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditData>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: user.name, email: user.email, role: user.role, status: user.status },
  });

  const mut = useMutation({
    mutationFn: (d: EditData) => updateUser(user._id, d),
    onSuccess: () => { toast.success('User updated! ✅'); onSuccess(); onClose(); },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e?.response?.data?.message ?? 'Failed to update user'),
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800 }}>Edit User</h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(240 5% 55%)', marginTop: 4 }}>Update details for {user.name}</p>
        </div>
        <button type="button" onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: '50%', background: 'hsl(240 8% 16%)',
            border: '1px solid hsl(240 10% 24%)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer'
          }}>
          <X size={16} style={{ color: 'hsl(240 5% 60%)' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit((d) => mut.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full Name" error={errors.name?.message}>
          <input {...register('name')} placeholder="John Doe" style={inputStyle(!!errors.name)} />
        </Field>
        <Field label="Email Address" error={errors.email?.message}>
          <input {...register('email')} type="email" style={inputStyle(!!errors.email)} />
        </Field>
        <Field label="Role">
          <select {...register('role')} style={inputStyle()} disabled={currentUserRole !== 'admin'}>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field label="Status">
          <select {...register('status')} style={inputStyle()} disabled={currentUserRole !== 'admin'}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, background: 'hsl(240 8% 16%)',
              border: '1px solid hsl(240 10% 24%)', color: 'hsl(240 5% 60%)', fontSize: '0.875rem',
              fontWeight: 600, cursor: 'pointer'
            }}>
            Cancel
          </button>
          <button type="submit" disabled={mut.isPending}
            style={{
              flex: 1, padding: '11px', borderRadius: 10,
              background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
              border: 'none', color: 'white', fontSize: '0.875rem', fontWeight: 700,
              cursor: mut.isPending ? 'not-allowed' : 'pointer', opacity: mut.isPending ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
            {mut.isPending ? <><Loader2 size={14} style={{ animation: 'my-spin 1s linear infinite' }} /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onConfirm, isPending }: { user: User; onClose: () => void; onConfirm: () => void; isPending: boolean }) {
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'hsl(0 72% 51% / 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
        }}>
          <Trash2 size={24} style={{ color: 'hsl(0 72% 65%)' }} />
        </div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Delete User</h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(240 5% 55%)', marginBottom: 24 }}>
          Are you sure you want to delete <strong style={{ color: 'hsl(240 5% 90%)' }}>{user.name}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={onClose}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, background: 'hsl(240 8% 16%)',
              border: '1px solid hsl(240 10% 24%)', color: 'hsl(240 5% 60%)', cursor: 'pointer', fontWeight: 600
            }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isPending}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, background: 'hsl(0 72% 45%)',
              border: 'none', color: 'white', cursor: isPending ? 'not-allowed' : 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
            {isPending ? <><Loader2 size={14} style={{ animation: 'my-spin 1s linear infinite' }} /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const columnHelper = createColumnHelper<User>();

export function UserListPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const qc = useQueryClient();

  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchAllUsers({ limit: 100 }),
  });

  const deleteMut = useMutation({
    mutationFn: () => {
      if (!selectedUser) throw new Error("No user selected");
      return deleteUser(selectedUser._id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['users-dashboard'] });
      toast.success('User deleted successfully');
      setModal(null);
      setSelectedUser(null);
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const memoizedColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'User',
      cell: (info) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: 'white',
            boxShadow: '0 0 10px hsl(265 80% 60% / 0.3)'
          }}>
            {info.getValue().charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{info.getValue()}</p>
            <p style={{ fontSize: '0.75rem', color: 'hsl(240 5% 50%)' }}>{info.row.original.email}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => <RoleBadge role={info.getValue()} />,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => <span style={{ fontSize: '0.8rem', color: 'hsl(240 5% 55%)' }}>{formatDate(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const targetRole = info.row.original.role;
        const targetId = info.row.original._id;
        const isSelf = currentUser?._id === targetId;

        const canEdit = isAdmin || (currentUser?.role === 'manager' && targetRole === 'user');

        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {canEdit && (
              <button
                type="button"
                onClick={() => { setSelectedUser(info.row.original); setModal('edit'); }}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'hsl(265 80% 60% / 0.15)',
                  border: '1px solid hsl(265 80% 60% / 0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}>
                <Edit3 size={14} style={{ color: 'hsl(265 80% 70%)' }} />
              </button>
            )}
            {isAdmin && !isSelf && (
              <button
                type="button"
                onClick={() => { setSelectedUser(info.row.original); setModal('delete'); }}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'hsl(0 72% 51% / 0.12)',
                  border: '1px solid hsl(0 72% 51% / 0.25)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}>
                <Trash2 size={14} style={{ color: 'hsl(0 72% 65%)' }} />
              </button>
            )}
          </div>
        );
      },
    }),
  ], [isAdmin, currentUser]);

  const tableData = useMemo(() => data?.users ?? [], [data?.users]);

  const table = useReactTable({
    data: tableData,
    columns: memoizedColumns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const closeModal = () => { setModal(null); setSelectedUser(null); };
  const refreshUsers = () => {
    qc.invalidateQueries({ queryKey: ['users'] });
    qc.invalidateQueries({ queryKey: ['users-dashboard'] });
  };

  return (
    <AnimatedPage>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 4, height: 24, borderRadius: 4, background: 'linear-gradient(180deg, hsl(265 80% 60%), hsl(230 70% 55%))' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800 }}>User Management</h1>
          </div>
          <p style={{ color: 'hsl(240 5% 55%)', fontSize: '0.88rem', marginLeft: 16 }}>
            {data?.pagination?.total ?? 0} users · {data?.users?.filter((u) => u.status === 'active').length ?? 0} active
          </p>
        </div>
        {isAdmin && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, boxShadow: '0 8px 30px hsl(265 80% 60% / 0.4)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setModal('create')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(230 70% 55%))', border: 'none',
              color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px hsl(265 80% 60% / 0.3)'
            }}
          >
            <Plus size={18} /> Add User
          </motion.button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 50%)' }} />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users..."
            style={{
              width: '100%', padding: '10px 14px 10px 42px', background: 'hsl(240 8% 12%)',
              border: '1px solid hsl(240 10% 22%)', borderRadius: 10, color: 'hsl(240 5% 96%)',
              fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden">
        {isLoading ? (
          <div style={{ padding: 40 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer rounded-xl" style={{ height: 56, marginBottom: 8 }} />
            ))}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} style={{ borderBottom: '1px solid hsl(240 10% 16%)' }}>
                  {hg.headers.map((header) => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}
                      style={{
                        padding: '14px 20px', textAlign: 'left', fontSize: '0.75rem',
                        fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                        color: 'hsl(240 5% 50%)', cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none', whiteSpace: 'nowrap'
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp size={12} />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown size={12} />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={memoizedColumns.length} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Users size={48} style={{ color: 'hsl(240 5% 30%)', margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ color: 'hsl(240 5% 45%)' }}>No users found</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}
                    style={{ borderBottom: '1px solid hsl(240 10% 14%)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'hsl(240 8% 13%)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ padding: '14px 20px' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!isLoading && table.getPageCount() > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderTop: '1px solid hsl(240 10% 16%)'
          }}>
            <p style={{ fontSize: '0.8rem', color: 'hsl(240 5% 50%)' }}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'hsl(240 8% 14%)',
                  border: '1px solid hsl(240 10% 22%)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
                  opacity: table.getCanPreviousPage() ? 1 : 0.4
                }}>
                <ChevronLeft size={16} style={{ color: 'hsl(240 5% 60%)' }} />
              </button>
              <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'hsl(240 8% 14%)',
                  border: '1px solid hsl(240 10% 22%)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
                  opacity: table.getCanNextPage() ? 1 : 0.4
                }}>
                <ChevronRight size={16} style={{ color: 'hsl(240 5% 60%)' }} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals — pure CSS overlay, no Radix Dialog */}
      <Modal open={modal === 'create'} onClose={closeModal}>
        <CreateUserModal onClose={closeModal} onSuccess={refreshUsers} />
      </Modal>

      <Modal open={modal === 'edit' && !!selectedUser} onClose={closeModal}>
        {selectedUser && <EditUserModal user={selectedUser} onClose={closeModal} onSuccess={refreshUsers} currentUserRole={currentUser?.role ?? 'user'} />}
      </Modal>

      <Modal open={modal === 'delete' && !!selectedUser} onClose={closeModal}>
        {selectedUser && (
          <DeleteModal user={selectedUser} onClose={closeModal}
            onConfirm={() => deleteMut.mutate()} isPending={deleteMut.isPending} />
        )}
      </Modal>

    </AnimatedPage>
  );
}
