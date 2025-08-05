import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { budgetService } from '../services/backend';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Progress from '../components/Progress.jsx';
import Modal from '../components/Modal.jsx';
import ChartComponent from '../components/ChartComponent.jsx';
import CurrencySelector from '../components/CurrencySelector.jsx';
import Divider from '../components/Divider.jsx';

export default function BudgetPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    budget: '',
    period: ''
  });

  // Load budgets from backend
  const loadBudgets = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await budgetService.getBudgets();
      if (result.success) {
        setBudgets(result.data);
      } else {
        setError(result.error || 'Failed to load budgets');
      }
    } catch (err) {
      setError('Failed to load budgets');
      console.error('Error loading budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const chartData = {
    labels: budgets.map(b => b.category),
    datasets: [
      {
        label: 'Budget',
        data: budgets.map(b => b.budget),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Spent',
        data: budgets.map(b => b.spent),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setFormData({ category: '', budget: '', period: '' });
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      budget: budget.budget.toString(),
      period: budget.period
    });
    setIsModalOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!formData.category || !formData.budget || !formData.period) {
      alert('Please fill all fields');
      return;
    }

    try {
      const budgetData = {
        category: formData.category,
        budget: parseFloat(formData.budget),
        currency: currency,
        period: formData.period
      };

      const result = await budgetService.addBudget(
        budgetData.category,
        budgetData.budget,
        budgetData.currency,
        budgetData.period
      );

      if (result.success) {
        setIsModalOpen(false);
        loadBudgets(); // Refresh data
      } else {
        alert(result.error || 'Failed to save budget');
      }
    } catch (err) {
      alert('Failed to save budget');
      console.error('Error saving budget:', err);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        // TODO: Implement delete budget service
        console.log('Delete budget:', id);
        loadBudgets(); // Refresh data
      } catch (err) {
        alert('Failed to delete budget');
        console.error('Error deleting budget:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={loadBudgets}
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Budget Planning
        </h1>
        <Button onClick={handleAddBudget} variant="primary">
          + Add Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Budget
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {currency} {totalBudget.toLocaleString()}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Spent
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {currency} {totalSpent.toLocaleString()}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Remaining
            </h3>
            <p className={`text-3xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currency} {remainingBudget.toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* Currency Selector */}
      <div className="flex justify-end">
        <CurrencySelector />
      </div>

      {/* Chart */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Budget vs Spent
        </h3>
        <ChartComponent 
          type="bar" 
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Budget Overview'
              }
            }
          }}
        />
      </Card>

      {/* Budget List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Budget Categories
        </h3>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const progress = (budget.spent / budget.budget) * 100;
            const isOverBudget = progress > 100;
            
            return (
              <div key={budget.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {budget.category}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Period: {budget.period}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {budget.currency} {budget.spent.toLocaleString()} / {budget.budget.toLocaleString()}
                    </p>
                    <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {progress.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(progress, 100)} 
                  max={100}
                  color={isOverBudget ? 'red' : progress > 80 ? 'yellow' : 'green'}
                />
                
                <div className="flex justify-end mt-2 space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleEditBudget(budget)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => handleDeleteBudget(budget.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add/Edit Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingBudget ? 'Edit Budget' : 'Add Budget'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Food & Dining"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget Amount
              </label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="Enter budget amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Period
              </label>
              <Input
                type="month"
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveBudget}>
              {editingBudget ? 'Update' : 'Add'} Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 