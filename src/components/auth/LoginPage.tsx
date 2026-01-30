import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { signIn } from '../../lib/auth';
import campusImage from 'figma:asset/8a2713311f0a1b3360f840d6ec31f9c8a5f19503.png';
import dmcLogo from 'figma:asset/a461850526c8fc44c279de3680cbf5b651ed0e20.png';




interface LoginPageProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LoginPage({ onLogin, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${campusImage})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={dmcLogo} alt="DMC Logo" className="w-20 h-20" />
          </div>
          <CardTitle className="text-white">DMC Care</CardTitle>
          <p className="text-white/90 mt-2">Sign in to access the dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 text-red-100 p-3 rounded-lg text-center backdrop-blur-sm border border-red-300/30">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white">Email</label>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 focus-within:border-white/50 focus-within:bg-white/30">
                <Mail className="w-5 h-5 text-white/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  className="flex-1 outline-none bg-transparent text-white placeholder:text-white/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white">Password</label>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 focus-within:border-white/50 focus-within:bg-white/30">
                <Lock className="w-5 h-5 text-white/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 outline-none bg-transparent text-white placeholder:text-white/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-white">
              New student?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-blue-200 hover:underline"
              >
                Register here
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-300/30">
            <p className="text-white mb-2">Demo Credentials:</p>
            <p className="text-blue-100">Admin: admin@school.com / admin123</p>
            <p className="text-blue-100/80 mt-1">
              (Create this account first by clicking "Register here" and selecting Admin role)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}