import React from 'react';
import { format } from 'date-fns';
import type { Transaction } from '../types';
import { formatCurrency } from '../lib/utils';
import StatusBadge from './ui/StatusBadge';
import { Card, CardContent } from './ui/Card';
import { Copy } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No transactions found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur border-b">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium w-12">Sr.No</th>
                <th className="text-left p-3 font-medium">School Id</th>
                <th className="text-left p-3 font-medium">Date & Time</th>
                <th className="text-left p-3 font-medium">Order ID</th>
                <th className="text-right p-3 font-medium">Order Amt</th>
                <th className="text-right p-3 font-medium">Transaction Amt</th>
                <th className="text-left p-3 font-medium">Gateway</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((t, idx) => (
                <tr key={t.collect_id} className="table-row-hover transition-all hover:bg-accent/60">
                  <td className="p-3 text-muted-foreground">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-medium truncate max-w-[260px]">{t.school_id}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>{format(new Date(t.payment_time || t.createdAt), 'dd/MM/yyyy, h:mm a')}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs truncate max-w-[220px]">{t.custom_order_id}</span>
                      <button
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        onClick={() => navigator.clipboard.writeText(t.custom_order_id)}
                        title="Copy Order ID"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right tabular-nums">{formatCurrency(t.order_amount || 0)}</td>
                  <td className="p-3 text-right tabular-nums">{formatCurrency(t.transaction_amount || 0)}</td>
                  <td className="p-3 whitespace-nowrap">{t.gateway || '—'}</td>
                  <td className="p-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="p-3">
                    <div className="font-medium truncate max-w-[180px]">{t.student_info?.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">{t.student_info?.email}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;