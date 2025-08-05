import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AddTransaction } from '../components/AddTransaction';
import { transactionService } from '../services/backend';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Badge from '../components/Badge.jsx';
import Table, { TableRow, TableCell } from '../components/Table.jsx';
import Tooltip from '../components/Tooltip.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Pagination from '../components/Pagination.jsx';
import Skeleton, { SkeletonTable } from '../components/Skeleton.jsx';
import Dropdown from '../components/Dropdown.jsx';
import Tag from '../components/Tag.jsx';
import Card from '../components/Card.jsx';

export default function TransactionsPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('');
  const [isOpenAddTransaction, setIsOpenAddTransaction] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load transactions from backend
  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await transactionService.getTransactions();
      if (result.success) {
        setTransactions(result.data);
      } else {
        setError(result.error || 'Failed to load transactions');
      }
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleTransactionAdded = () => {
    loadTransactions(); // Refresh data after adding transaction
  };

  const filteredTx = transactions.filter(tx =>
    (filterType === 'ALL' || (filterType === 'Income' && tx.is_income) || (filterType === 'Expense' && !tx.is_income)) &&
    (filterCategory === '' || tx.category === filterCategory)
  );

  const totalItems = filteredTx.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTx = filteredTx.slice(startIndex, endIndex);

  const tableHeaders = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Currency', 'Action'];

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Transactions', href: '/transactions' }
  ];

  const handleEdit = (tx) => {
    console.log('Edit transaction:', tx);
    // Implement edit logic
  };

  const handleDelete = (tx) => {
    console.log('Delete transaction:', tx);
    // Implement delete logic
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <SkeletonTable rows={5} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={loadTransactions}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transactions</h2>
        <Button 
          onClick={() => setIsOpenAddTransaction(true)}
        >
          + Add Transaction
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </Select>
        <Input 
          placeholder="Category" 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)} 
        />
        <Button variant="secondary" size="sm">
          Export CSV
        </Button>
      </div>
      
      {/* Table transaksi */}
      <Card>
        <Table headers={tableHeaders}>
          {paginatedTx.map((tx, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(tx.timestamp / 1000000).toLocaleDateString()}
              </TableCell>
              <TableCell>{tx.description}</TableCell>
              <TableCell>
                <Tag color="blue">{tx.category}</Tag>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={tx.is_income ? 'success' : 'danger'}
                  size="sm"
                >
                  {tx.is_income ? 'Income' : 'Expense'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {tx.currency} {tx.amount.toLocaleString()}
              </TableCell>
              <TableCell>{tx.currency}</TableCell>
              <TableCell>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      ⋯
                    </Button>
                  }
                  items={[
                    { label: 'Edit', onClick: () => handleEdit(tx) },
                    { label: 'Delete', onClick: () => handleDelete(tx) }
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </Table>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Add Transaction Modal */}
      <AddTransaction
        isOpen={isOpenAddTransaction}
        onClose={() => setIsOpenAddTransaction(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
} 