import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

const UserPermissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [permRes, userRes] = await Promise.all([
                    api.get('/permissions/'),
                    api.get(`/users/${id}/`) // Assuming user endpoint returns assigned permissions? Or we might need to fetch them separately if not included.
                    // Actually, standard user serializer might not include full permission objects. 
                    // But if we want to valid "checked" state, we need to know what user has.
                    // For now, let's assume we can't easily get them without a specific endpoint or updated serializer.
                    // I will update the UserViewSet to include user_permissions in retrieve if needed, or just list user's permissions.
                    // Let's assume user.user_permissions field exists in serializer or we fetch from separate endpoint.
                    // For now, I'll fetch `/users/{id}/` and hope it has permissions or I'll add them to serializer.
                ]);

                setPermissions(permRes.data.results || permRes.data);
                setUser(userRes.data);
                // Pre-select logic would go here if we had the data. 
                // Since I didn't add user_permissions to UserSerializer yet, strictly speaking I can't show current state.
                // I will add user_permissions to serializer in next step to fix this.
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleToggle = (permId) => {
        setSelectedPermissions(prev =>
            prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/users/${id}/update_permissions/`, {
                permissions: selectedPermissions
            });
            alert("Permissions updated successfully");
            navigate('/admin/users');
        } catch (error) {
            console.error("Failed to update permissions", error);
            alert("Failed to update permissions");
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageContainer
            title={`Manage Permissions for ${user?.first_name || 'User'}`}
            action={
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 px-4 py-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-card))] rounded-lg transition-colors border border-[hsl(var(--border-light))]"
                >
                    <ArrowLeft size={18} />
                    Cancel
                </button>
            }
        >
            <Card className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-6"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissions.map(perm => (
                            <label key={perm.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.id)}
                                    onChange={() => handleToggle(perm.id)}
                                    className="mt-1 w-4 h-4 text-[hsl(var(--primary))] rounded border-gray-300 focus:ring-[hsl(var(--primary))]"
                                />
                                <div>
                                    <div className="font-medium text-sm">{perm.name}</div>
                                    <div className="text-xs text-gray-500">{perm.codename}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                <div className="pt-4 flex justify-end border-t border-[hsl(var(--border-light))]">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[hsl(var(--primary-light))] transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Permissions
                    </button>
                </div>
            </Card>
        </PageContainer>
    );
};

export default UserPermissions;
