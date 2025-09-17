import React, { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { paymentService } from '../services/payment';
import TransactionTable from '../components/TransactionTable';
import Pagination from '../components/Pagination';
import type { TransactionResponse } from '../types';

const STATUSES = ['success', 'pending', 'failed', 'initiated'];

const Transactions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
  const search = searchParams.get('search') || '';
  const status = searchParams.getAll('status');
  const schoolIds = searchParams.getAll('school_id');
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const { data, isLoading, error } = useQuery<TransactionResponse>({
    queryKey: ['transactions', { page, limit, sortBy, order, search, status, schoolIds, startDate, endDate }],
    queryFn: () => paymentService.getAllTransactions({
      page,
      limit,
      sortBy,
      order,
      search: search || undefined,
      status: status.length ? status : undefined,
      school_id: schoolIds.length ? schoolIds : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    placeholderData: keepPreviousData,
  });

  // School list for dropdown
  // If you prefer a dropdown of schools, you can re-enable this query
  // and render a select. We will use a free-text School ID input instead.

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key); else next.set(key, value);
    next.set('page', '1');
    setSearchParams(next);
  };

  const toggleMultiParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    const current = new Set(next.getAll(key));
    if (current.has(value)) current.delete(value); else current.add(value);
    next.delete(key);
    current.forEach(v => next.append(key, v));
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSort = (column: string) => {
    const next = new URLSearchParams(searchParams);
    const currentSort = next.get('sortBy');
    const currentOrder = (next.get('order') || 'asc') as 'asc' | 'desc';
    if (currentSort === column) {
      next.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      next.set('sortBy', column);
      next.set('order', 'asc');
    }
    setSearchParams(next);
  };

  const onPageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const selectedStatuses = useMemo(() => new Set(status), [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Transactions</h1>
        <p className="text-muted-foreground mt-2">Browse, filter, and sort transactions</p>
      </div>

      {/* Toolbar Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-12 items-center">
            {/* Search */}
            <div className="md:col-span-3 flex items-center gap-2">
              <Input
                placeholder="Search (Order ID, Collect ID, Student...)"
                value={search}
                onChange={(e) => setParam('search', e.target.value || undefined)}
                className="h-9"
              />
              <Button
                size="sm"
                onClick={() => setParam('search', search || undefined)}
                className="h-9"
              >
                Search
              </Button>
            </div>

            {/* Filter By (sort) */}
            <div className="md:col-span-2 flex items-center gap-2">
              <select
                className="h-9 px-2 rounded-md border bg-background text-sm w-full"
                value={sortBy}
                onChange={(e) => setParam('sortBy', e.target.value)}
              >
                <option value="createdAt">Date</option>
                <option value="transaction_amount">Transaction Amount</option>
                <option value="order_amount">Order Amount</option>
                <option value="status">Status</option>
                <option value="gateway">Gateway</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParam('order', order === 'asc' ? 'desc' : 'asc')}
                title="Toggle sort order"
              >
                {order === 'asc' ? '▲' : '▼'}
              </Button>
            </div>

            {/* Status dropdown */}
            <div className="md:col-span-2">
              <select
                className="h-9 px-2 rounded-md border bg-background text-sm w-full"
                value={status[0] || ''}
                onChange={(e) => setParam('status', e.target.value || undefined)}
              >
                <option value="">Status</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* School ID free text */}
            <div className="md:col-span-3">
              <Input
                placeholder="School ID"
                value={schoolIds[0] || ''}
                onChange={(e) => setParam('school_id', e.target.value || undefined)}
                className="h-9"
              />
            </div>

            {/* Rows per page */}
            <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2">
              <span className="text-xs text-muted-foreground">Rows per page:</span>
              <select
                className="h-9 px-2 rounded-md border bg-background text-sm"
                value={limit}
                onChange={(e) => setParam('limit', e.target.value)}
              >
                {[10,20,50,100].map(n => (
                  <option value={n} key={n}>{n}</option>
                ))}
              </select>
              <Button variant="ghost" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-6 text-destructive">
            Failed to load transactions. Please check your API and auth token.
          </CardContent>
        </Card>
      )}

      <TransactionTable transactions={data?.transactions || []} loading={isLoading} />
      {data?.pagination && <Pagination pagination={data.pagination} onPageChange={onPageChange} />}
    </div>
  );
};

export default Transactions;


