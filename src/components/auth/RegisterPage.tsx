import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { API_URL } from '../../lib/supabase';
import { publicAnonKey } from '../../utils/supabase/info';
import dmcLogo from 'figma:asset/a461850526c8fc44c279de3680cbf5b651ed0e20.png';
import React from "react";

interface RegisterPageProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onRegister, onNavigateToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setSuccess(true);
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <button
            onClick={onNavigateToLogin}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={dmcLogo} alt="DMC Logo" className="w-20 h-20" />
          </div>
          <CardTitle className="text-center text-gray-900">Create Account</CardTitle>
          <p className="text-center text-gray-600 mt-2">Register as a new student or admin</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
              Registration successful! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-gray-700">Full Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="flex-1 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Email</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@school.com"
                    className="flex-1 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Password</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="flex-1 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700">Confirm Password</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}