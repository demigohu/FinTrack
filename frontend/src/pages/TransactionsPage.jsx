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
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterCurrency, setFilterCurrency] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'blockchain'
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

  const filteredTx = transactions.filter(tx => {
    const typeMatch = filterType === 'ALL' || 
      (filterType === 'Income' && tx.is_income) || 
      (filterType === 'Expense' && !tx.is_income);
    const categoryMatch = filterCategory === '' || tx.category === filterCategory;
    
    // Handle source filtering with fallback
    let sourceMatch = true;
    if (filterSource !== 'ALL') {
      let txSource = tx.source || 'manual'; // Default to manual if no source
      
      // Handle array format for source field
      if (Array.isArray(txSource)) {
        txSource = txSource[0] || 'manual';
      }
      
      console.log('Filtering by source:', filterSource, 'Transaction source:', txSource, 'Match:', txSource === filterSource);
      sourceMatch = txSource === filterSource;
    }
    
    // Filter by active tab
    let tabMatch = true;
    if (activeTab === 'blockchain') {
      let txSource = tx.source || 'manual';
      
      // Handle array format for source field
      if (Array.isArray(txSource)) {
        txSource = txSource[0] || 'manual';
      }
      
      tabMatch = txSource === 'blockchain';
      console.log('Blockchain tab filtering:', 'Transaction source:', txSource, 'Match:', tabMatch);
    }
    
    const currencyMatch = filterCurrency === 'ALL' || tx.currency === filterCurrency;
    
    return typeMatch && categoryMatch && sourceMatch && tabMatch && currencyMatch;
  });

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

  const handleSyncBlockchain = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await transactionService.syncBlockchainTransactions();
      if (result.success) {
        // Reload transactions after sync
        await loadTransactions();
        alert('Blockchain transactions synced successfully!');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to sync blockchain transactions');
      console.error('Sync error:', error);
    } finally {
      setLoading(false);
    }
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

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📊 All Transactions
        </button>
        <button
          onClick={() => setActiveTab('blockchain')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'blockchain' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          🔗 Blockchain Transactions
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </Select>
        <Select value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="ALL">All Sources</option>
          <option value="manual">Manual Input</option>
          <option value="blockchain">Blockchain</option>
        </Select>
        <Select value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)}>
          <option value="ALL">All Currencies</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="SOL">SOL</option>
        </Select>
        <Input 
          placeholder="Category" 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)} 
        />
        <Button variant="secondary" size="sm">
          Export CSV
        </Button>
        <Button 
          variant="primary" 
          size="sm"
          onClick={handleSyncBlockchain}
          disabled={loading}
        >
          🔄 Sync Blockchain
        </Button>
      </div>
      
      {/* Table transaksi */}
      <Card>
        <Table headers={activeTab === 'all' ? tableHeaders : [...tableHeaders, 'Source', 'Details']}>
          {paginatedTx.map((tx, index) => (
            <TableRow key={index}>
              <TableCell>
                {tx.date ? new Date(tx.date).toLocaleDateString() : new Date(Number(tx.timestamp) / 1000000).toLocaleDateString()}
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
                {tx.currency} {Number(tx.amount).toLocaleString()}
              </TableCell>
              <TableCell>{tx.currency}</TableCell>
              {activeTab === 'all' ? (
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
              ) : (
                <>
                  <TableCell>
                    {(() => {
                      let txSource = tx.source || 'manual';
                      if (Array.isArray(txSource)) {
                        txSource = txSource[0] || 'manual';
                      }
                      return (
                        <span className={`px-2 py-1 rounded text-xs ${
                          txSource === 'manual' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {txSource === 'manual' ? 'Manual' : 'Blockchain'}
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {tx.txid && (
                      <a 
                        href={`https://blockchain.info/tx/${String(tx.txid)}`} 
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        {String(tx.txid).substring(0, 8)}...
                      </a>
                    )}
                  </TableCell>
                </>
              )}
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