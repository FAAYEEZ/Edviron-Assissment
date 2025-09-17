import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import Loading from '../components/ui/Loading';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string>('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError('');
      await login(data.email, data.password);
      toast.success('Logged in successfully');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Login failed';
      setServerError(msg);
      toast.error(msg);
    }
  };

  const handleCreateTestUser = async () => {
    // Creates a user with current form values; then tries to login
    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
    const password = (document.querySelector('input[type="password"]') as HTMLInputElement)?.value;
    if (!email || !password) {
      toast.error('Enter email and password first');
      return;
    }
    try {
      setServerError('');
      await authService.register(email, password);
      toast.success('User registered');
      await login(email, password);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Registration failed';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Access your School Payments dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {serverError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 p-2 rounded">
                  {serverError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loading size="sm" className="mr-2" /> Signing in...</> : 'Sign in'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                No account? <Link to="/register" className="text-primary underline">Create one</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;