import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate a small delay for better UX (optional, can be removed)
        // await new Promise(resolve => setTimeout(resolve, 800));

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-[hsl(var(--bg-body))]">
            {/* Left Side - Brand / Visuals */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[hsl(var(--primary))] items-center justify-center p-12">
                {/* Abstract animated background shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[hsl(var(--accent))] rounded-full blur-[150px] opacity-20 animate-pulse-slow"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[hsl(var(--primary-light))] rounded-full blur-[150px] opacity-40"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <h1 className="text-6xl font-bold mb-6 tracking-tight">
                        Salesly
                    </h1>
                    <p className="text-xl text-blue-100/80 leading-relaxed mb-8">
                        Manage your sales, track inventory, and grow your business with our comprehensive dashboard solution.
                    </p>

                    {/* <div className="grid grid-cols-2 gap-4 text-sm font-medium text-blue-200/60">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></div>
                            Real-time Analytics
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></div>
                            Inventory Tracking
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></div>
                            Customer Insights
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></div>
                            Secure & Reliable
                        </div>
                    </div> */}
                </div>

                {/* Glassmorphism card decoration */}
                <div className="absolute bottom-12 left-12 right-12 h-24 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center px-8 justify-between">
                    <div>
                        {/* <p className="text-white font-medium">Trusted by 10,000+ businesses</p> */}
                        <p className="text-white/40 text-xs">Join the revolution today</p>
                    </div>
                    {/* <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border-2 border-[hsl(var(--primary))]"></div>
                        ))}
                    </div> */}
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Background decoration */}
                <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[hsl(var(--accent))] rounded-full blur-[100px] opacity-10"></div>
                </div>

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-[hsl(var(--text-main))] tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-[hsl(var(--text-secondary))]">Enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--text-main))] mb-1.5">Email</label>
                                <div className={`relative group transition-all duration-300 ${focusedInput === 'email' ? 'scale-[1.01]' : ''}`}>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="w-full px-4 py-3.5 bg-white border border-[hsl(var(--border-light))] rounded-xl text-[hsl(var(--text-main))] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))/20] focus:border-[hsl(var(--accent))] transition-all shadow-sm"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--text-main))] mb-1.5">Password</label>
                                <div className={`relative group transition-all duration-300 ${focusedInput === 'password' ? 'scale-[1.01]' : ''}`}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="w-full px-4 py-3.5 bg-white border border-[hsl(var(--border-light))] rounded-xl text-[hsl(var(--text-main))] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))/20] focus:border-[hsl(var(--accent))] transition-all shadow-sm pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))] p-1 rounded-md transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button type="button" className="text-xs font-medium text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-hover))] hover:underline transition-colors">
                                        Forgot password?
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-semibold rounded-xl shadow-lg shadow-[hsl(var(--accent))/20] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-sm text-[hsl(var(--text-muted))]">
                            Don't have an account?{' '}
                            <button className="font-medium text-[hsl(var(--text-main))] hover:text-[hsl(var(--accent))] transition-colors">
                                Contact Administrator
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

