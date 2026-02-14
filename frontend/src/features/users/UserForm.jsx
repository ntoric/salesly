import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const UserForm = () => {
    const { id } = useParams();
    const location = useLocation();
    const isProfile = location.pathname.endsWith('/profile');
    const isEdit = !!id || isProfile;
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isStatsUser = currentUser?.is_staff || currentUser?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'MERCHANT',
        is_active: true
    });

    useEffect(() => {
        if (isEdit) {
            const fetchUser = async () => {
                try {
                    let response;
                    if (isProfile) {
                        response = await api.get('/auth/me/');
                    } else {
                        response = await api.get(`/users/${id}/`);
                    }
                    setFormData({
                        ...response.data,
                        password: '' // Don't show password
                    });
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    toast.error("Failed to load user details");
                    navigate(basePath);
                }
            };
            // Only fetch if we have an ID or if it's profile mode and we have currentUser
            if (id || (isProfile && currentUser)) {
                fetchUser();
            }
        }
    }, [id, isEdit, navigate, basePath, isProfile, currentUser]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                const payload = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone
                };

                if (isProfile) {
                    await api.patch('/auth/me/', payload);
                } else {
                    await api.patch(`/users/${id}/`, payload);
                }
                toast.success(isProfile ? "Profile updated successfully" : "User updated successfully");

                if (isProfile) {
                    // Optional: refresh auth user if name changed (requires AuthContext update logic)
                    // For now just stay on page or go to dashboard
                    return;
                }
            } else {
                await api.post('/users/', formData);
                toast.success("User created successfully");
            }
            navigate(`${basePath}/users`);
        } catch (error) {
            console.error("Save failed", error);
            const msg = error.response?.data?.detail || "Failed to save user";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const canSelectRole = currentUser?.role === 'SUPER_ADMIN' && !isProfile;

    return (
        <PageContainer
            title={isProfile ? "My Profile" : (isEdit ? "Edit User" : "Add New User")}
            action={
                <button
                    onClick={() => navigate(isProfile ? basePath : `${basePath}/users`)}
                    className="flex items-center gap-2 px-4 py-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-card))] rounded-lg transition-colors border border-[hsl(var(--border-light))]"
                >
                    <ArrowLeft size={18} />
                    {isProfile ? 'Back to Dashboard' : 'Cancel'}
                </button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <Card className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[hsl(var(--text-main))]">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[hsl(var(--text-main))]">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                            />
                        </div>

                        {/* Email (Read only in Edit) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[hsl(var(--text-main))]">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                disabled={isEdit}
                                value={formData.email}
                                onChange={handleChange}
                                className={clsx(
                                    "w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]",
                                    isEdit && "opacity-60 cursor-not-allowed"
                                )}
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[hsl(var(--text-main))]">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                            />
                        </div>

                        {/* Role (Only Super Admin can change, and only on create mostly) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[hsl(var(--text-main))]">Role</label>
                            <select
                                name="role"
                                disabled={!canSelectRole || isEdit}
                                value={formData.role}
                                onChange={handleChange}
                                className={clsx(
                                    "w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]",
                                    (!canSelectRole || isEdit) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                <option value="MERCHANT">Merchant</option>
                                <option value="TENANT_ADMIN">Tenant Admin</option>
                                {canSelectRole && <option value="SUPER_ADMIN">Super Admin</option>}
                            </select>
                            {!canSelectRole && !isEdit && (
                                <p className="text-xs text-[hsl(var(--text-muted))]">You can only create Merchants.</p>
                            )}
                        </div>

                        {/* Password (Only on Create) */}
                        {!isEdit && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[hsl(var(--text-main))]">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required={!isEdit}
                                    minLength={5}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end border-t border-[hsl(var(--border-light))]">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[hsl(var(--primary-light))] transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isEdit ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </Card>
            </form>
        </PageContainer>
    );
};

export default UserForm;
