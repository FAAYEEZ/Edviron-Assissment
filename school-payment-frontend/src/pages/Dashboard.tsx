import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CreditCard, Search, School, Plus } from 'lucide-react';
import { paymentService } from '../services/payment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => paymentService.getTransactionStats(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of transactions and quick actions</p>
        </div>
        <div className="flex gap-2">
          <Link to="/transactions">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" /> View Transactions
            </Button>
          </Link>
          <Link to="/transaction-status">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" /> Check Status
            </Button>
          </Link>
          <Link to="/create-payment">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create Payment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle>{isLoading ? <Loading size="sm" /> : stats?.totalTransactions ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Amount</CardDescription>
            <CardTitle>{isLoading ? <Loading size="sm" /> : formatCurrency(stats?.totalAmount || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>By Status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <Loading size="sm" />}
            {!isLoading && (stats?.statusStats || []).map((s) => (
              <div className="flex items-center justify-between" key={s._id}>
                <StatusBadge status={s._id} />
                <div className="text-sm text-muted-foreground">{s.count} • {formatCurrency(s.totalAmount)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <School className="h-5 w-5 mr-2" /> Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link to="/transactions/school"><Button variant="outline">School Transactions</Button></Link>
          <Link to="/transactions"><Button variant="outline">All Transactions</Button></Link>
          <Link to="/transaction-status"><Button variant="outline">Check Status</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;


