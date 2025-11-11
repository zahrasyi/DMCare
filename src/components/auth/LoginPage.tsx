import { useState } from 'react';
import { Heart, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { signIn } from '../../lib/auth';
import React from 'react';
import Background from '../../assets/bg.jpg'; 

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
      // Menggunakan penanganan error yang lebih aman untuk mencegah error TypeScript
      const errorMessage = (err instanceof Error) ? err.message : 'Failed to login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✨ PERUBAHAN UTAMA DI SINI: Menggunakan template literal (`url(${...})`)
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        // 🚀 KODE YANG BENAR: Menggunakan variabel BackgroundImage yang sudah diimpor
        backgroundImage: `url(${Background})`, 
        backgroundSize: 'cover', // Menutupi seluruh area
        backgroundPosition: 'center', // Memposisikan gambar di tengah
        backgroundRepeat: 'no-repeat', // Mencegah gambar berulang
        
        // Opsional: Overlay agar konten di atas BG tetap mudah dibaca
        backgroundColor: 'rgba(255, 255, 255, 0)', 
        backgroundBlendMode: 'overlay', 
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
          <CardTitle className="text-gray-900">DMC Care</CardTitle>
          <p className="text-gray-600 mt-2">Sign in to access the dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-gray-700">Email</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  className="flex-1 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700">Password</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 outline-none"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-gray-600">
              New student?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-blue-600 hover:underline"
              >
                Register here
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-900 mb-2">Demo Credentials:</p>
            <p className="text-blue-700">Admin: admin@school.com / admin123</p>
            <p className="text-blue-600 mt-1">
              (Create this account first by clicking "Register here" and selecting Admin role)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}