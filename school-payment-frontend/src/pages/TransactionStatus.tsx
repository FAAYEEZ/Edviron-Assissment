import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { paymentService } from '../services/payment';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../lib/utils';
import Loading from '../components/ui/Loading';

const TransactionStatus: React.FC = () => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction-status', searchOrderId],
    queryFn: () => paymentService.getTransactionStatus(searchOrderId),
    enabled: !!searchOrderId,
  });

  const handleSearch = () => {
    if (orderIdInput.trim()) {
      setSearchOrderId(orderIdInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Status</h1>
        <p className="text-muted-foreground mt-2">
          Check the status of a specific transaction
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Transaction</CardTitle>
          <CardDescription>
            Enter the custom order ID to check transaction status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter custom order ID (e.g., ORD_1711622270_abc123)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <Loading />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Searching for transaction...
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Transaction not found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check the order ID and try again
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {transaction && !isLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Transaction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <StatusBadge status={transaction.status} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gateway</p>
                  <p className="font-medium">{transaction.gateway_name || transaction.gateway || (transaction.payment_mode ? transaction.payment_mode.toUpperCase() : '—')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Amount</p>
                  <p className="font-medium">{formatCurrency(transaction.order_amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction Amount</p>
                  <p className="font-medium">{formatCurrency(transaction.transaction_amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Mode</p>
                  <p className="font-medium">{transaction.payment_mode?.toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Reference</p>
                  <p className="font-medium font-mono text-sm">{transaction.bank_reference || 'N/A'}</p>
                </div>
              </div>

              {transaction.payment_time && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Time</p>
                  <p className="font-medium">{formatDate(transaction.payment_time)}</p>
                </div>
              )}

              {transaction.payment_message && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Message</p>
                  <p className="font-medium">{transaction.payment_message}</p>
                </div>
              )}

              {transaction.error_message && transaction.error_message !== 'NA' && (
                <div>
                  <p className="text-sm font-medium text-destructive">Error Message</p>
                  <p className="text-destructive">{transaction.error_message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custom Order ID</p>
                <p className="font-mono text-sm">{transaction.custom_order_id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collect ID</p>
                <p className="font-mono text-sm">{transaction.collect_id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">School ID</p>
                <p className="font-mono text-sm">{transaction.school_id}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Student Information</p>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p><span className="font-medium">Name:</span> {transaction.student_info.name}</p>
                  <p><span className="font-medium">ID:</span> {transaction.student_info.id}</p>
                  <p><span className="font-medium">Email:</span> {transaction.student_info.email}</p>
                </div>
              </div>

              {transaction.createdAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p>{formatDate(transaction.createdAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!searchOrderId && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Enter a custom order ID to check transaction status
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionStatus;