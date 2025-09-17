import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { paymentService } from '../services/payment';
import TransactionTable from '../components/TransactionTable';
import Pagination from '../components/Pagination';

const SchoolTransactions: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const { data: schoolIds } = useQuery({
    queryKey: ['school-ids'],
    queryFn: () => paymentService.getSchoolIds(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['school-transactions', selectedSchoolId, page],
    queryFn: () => selectedSchoolId 
      ? paymentService.getTransactionsBySchool(selectedSchoolId, page, 10)
      : Promise.resolve({ transactions: [], pagination: {} as any }),
    enabled: !!selectedSchoolId,
  });

  const handleSchoolSelect = () => {
    if (searchInput.trim()) {
      setSelectedSchoolId(searchInput.trim());
      setPage(1);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setSearchInput(schoolId);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">School Transactions</h1>
        <p className="text-muted-foreground mt-2">
          View transactions for a specific school
        </p>
      </div>

      {/* School Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select School</CardTitle>
          <CardDescription>
            Enter or select a school ID to view its transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter school ID (e.g., 65b0e6293e9f76a9694d84b4)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSchoolSelect()}
              className="flex-1"
            />
            <Button onClick={handleSchoolSelect}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick Select from Available Schools */}
          {schoolIds && schoolIds.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                {schoolIds.map((schoolId) => (
                  <Button
                    key={schoolId}
                    variant={selectedSchoolId === schoolId ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSchoolChange(schoolId)}
                    className="text-xs"
                  >
                    {schoolId}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {selectedSchoolId && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Transactions for School: {selectedSchoolId}
            </h2>
            {data?.pagination && (
              <p className="text-sm text-muted-foreground">
                {data.pagination.total} transactions found
              </p>
            )}
          </div>

          <TransactionTable 
            transactions={data?.transactions || []}
            loading={isLoading}
          />

          {data?.pagination && (
            <Pagination
              pagination={data.pagination}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {!selectedSchoolId && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Please select a school ID to view transactions
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolTransactions;