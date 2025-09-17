import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreditCard, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { paymentService } from '../services/payment';
import type { CreatePaymentRequest } from '../types';
import Loading from '../components/ui/Loading';

const createPaymentSchema = z.object({
  school_id: z.string().min(1, 'School ID is required'),
  trustee_id: z.string().min(1, 'Trustee ID is required'),
  student_name: z.string().min(1, 'Student name is required'),
  student_id: z.string().min(1, 'Student ID is required'),
  student_email: z.string().email('Invalid email address'),
  gateway_name: z.string().min(1, 'Gateway is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  // Redirect URL removed from UI; keep type optional for backward compatibility
  redirect_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type CreatePaymentForm = z.infer<typeof createPaymentSchema>;

const CreatePayment: React.FC = () => {
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePaymentForm>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      school_id: '65b0e6293e9f76a9694d84b4',
      trustee_id: '65b0e552dd31950a9b41c5ba',
      gateway_name: 'PhonePe',
      // redirect_url removed
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentService.createPayment(data),
    onSuccess: (result) => {
      setPaymentResult(result);
      toast.success('Payment request created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment');
    },
  });

  const onSubmit = (data: CreatePaymentForm) => {
    const paymentData: CreatePaymentRequest = {
      school_id: data.school_id,
      trustee_id: data.trustee_id,
      student_info: {
        name: data.student_name,
        id: data.student_id,
        email: data.student_email,
      },
      gateway_name: data.gateway_name,
      amount: data.amount,
      // No redirect_url from the form
    };

    createPaymentMutation.mutate(paymentData);
  };

  const handleNewPayment = () => {
    setPaymentResult(null);
    reset();
  };

  const gateways = ['PhonePe', 'Paytm', 'Razorpay', 'GooglePay'];

  if (paymentResult) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Created</h1>
          <p className="text-muted-foreground mt-2">
            Payment request has been created successfully
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Payment Request Created</CardTitle>
            <CardDescription>
              The payment has been initiated. Please proceed to complete the payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">{paymentResult.custom_order_id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{paymentResult.status}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment URL</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                    {paymentResult.payment_url}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => window.open(paymentResult.payment_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={() => window.open(paymentResult.payment_url, '_blank')}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNewPayment}
              >
                Create Another Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Payment</h1>
        <p className="text-muted-foreground mt-2">
          Create a new payment request for a student
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Fill in the details to create a new payment request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* School and Trustee Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">School ID *</label>
                <Input
                  {...register('school_id')}
                  placeholder="65b0e6293e9f76a9694d84b4"
                />
                {errors.school_id && (
                  <p className="text-sm text-destructive">{errors.school_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trustee ID *</label>
                <Input
                  {...register('trustee_id')}
                  placeholder="65b0e552dd31950a9b41c5ba"
                />
                {errors.trustee_id && (
                  <p className="text-sm text-destructive">{errors.trustee_id.message}</p>
                )}
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Student Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student Name *</label>
                  <Input
                    {...register('student_name')}
                    placeholder="John Doe"
                  />
                  {errors.student_name && (
                    <p className="text-sm text-destructive">{errors.student_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Student ID *</label>
                  <Input
                    {...register('student_id')}
                    placeholder="STD001"
                  />
                  {errors.student_id && (
                    <p className="text-sm text-destructive">{errors.student_id.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Student Email *</label>
                <Input
                  type="email"
                  {...register('student_email')}
                  placeholder="student@example.com"
                />
                {errors.student_email && (
                  <p className="text-sm text-destructive">{errors.student_email.message}</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gateway *</label>
                  <select
                    {...register('gateway_name')}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    {gateways.map((gateway) => (
                      <option key={gateway} value={gateway}>
                        {gateway}
                      </option>
                    ))}
                  </select>
                  {errors.gateway_name && (
                    <p className="text-sm text-destructive">{errors.gateway_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₹) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    {...register('amount', { valueAsNumber: true })}
                    placeholder="2500.00"
                  />
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>
              </div>

              {/* Redirect URL field removed as requested */}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Creating Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create Payment Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePayment;