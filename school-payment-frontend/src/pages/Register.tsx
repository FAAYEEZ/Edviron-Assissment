import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
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

const registerSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>('');
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      setServerError('');
      await authService.register(data.email, data.password);
      toast.success('User registered successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (e: any) {
      const status = e?.response?.status as number | undefined;
      const srvMsg: string | undefined = e?.response?.data?.message;
      const duplicate =
        status === 409 ||
        (typeof srvMsg === 'string' && srvMsg.toLowerCase().includes('duplicate')) ||
        (typeof srvMsg === 'string' && srvMsg.toLowerCase().includes('already registered'));

      const msg = duplicate ? 'Email already registered' : (srvMsg || 'Registration failed');
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Register to access School Payments</CardDescription>
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

              <Button type="submit" className="w-full">
                <Loading size="sm" className="mr-2 hidden" />
                Create account
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account? <Link to="/login" className="text-primary underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;


