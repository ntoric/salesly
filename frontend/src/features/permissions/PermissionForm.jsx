import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

const PermissionForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        codename: '',
        content_type: 1 // Default to first content type for now, real app should fetch them
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/permissions/', formData);
            alert("Permission created successfully");
            navigate('/admin/permissions');
        } catch (error) {
            console.error("Failed to create permission", error);
            alert("Failed to create permission. Codename might be duplicate.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer
            title="Add Permission"
            action={
                <button
                    onClick={() => navigate('/admin/permissions')}
                    className="flex items-center gap-2 px-4 py-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-card))] rounded-lg transition-colors border border-[hsl(var(--border-light))]"
                >
                    <ArrowLeft size={18} />
                    Cancel
                </button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <Card className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--text-main))]">Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                            placeholder="Can view dashboard"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--text-main))]">Codename</label>
                        <input
                            type="text"
                            name="codename"
                            required
                            value={formData.codename}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                            placeholder="can_view_dashboard"
                        />
                    </div>

                    <div className="pt-4 flex justify-end border-t border-[hsl(var(--border-light))]">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[hsl(var(--primary-light))] transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Create Permission
                        </button>
                    </div>
                </Card>
            </form>
        </PageContainer>
    );
};

export default PermissionForm;
