import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { goalService } from '../services/backend';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Progress from '../components/Progress.jsx';
import Modal from '../components/Modal.jsx';
import CurrencySelector from '../components/CurrencySelector.jsx';
import Divider from '../components/Divider.jsx';
import Timeline from '../components/Timeline.jsx';
import Badge from '../components/Badge.jsx';

export default function GoalsPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: '',
    priority: 'medium'
  });

  // Load goals from backend
  const loadGoals = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await goalService.getGoals();
      if (result.success) {
        setGoals(result.data);
      } else {
        setError(result.error || 'Failed to load goals');
      }
    } catch (err) {
      setError('Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'active': return 'blue';
      case 'paused': return 'yellow';
      default: return 'gray';
    }
  };

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrent / totalTarget) * 100;

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  const handleAddGoal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: '',
      priority: 'medium'
    });
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority
    });
    setIsModalOpen(true);
  };

  const handleSaveGoal = async () => {
    if (!formData.title || !formData.targetAmount || !formData.currentAmount || !formData.deadline) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const goalData = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        currency: currency,
        deadline: formData.deadline,
        category: formData.category,
        priority: formData.priority
      };

      const result = await goalService.addGoal(
        goalData.title,
        goalData.description,
        goalData.targetAmount,
        goalData.currentAmount,
        goalData.currency,
        goalData.deadline,
        goalData.category,
        goalData.priority
      );

      if (result.success) {
        setIsModalOpen(false);
        loadGoals(); // Refresh data
      } else {
        alert(result.error || 'Failed to save goal');
      }
    } catch (err) {
      alert('Failed to save goal');
      console.error('Error saving goal:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        // TODO: Implement delete goal service
        console.log('Delete goal:', id);
        loadGoals(); // Refresh data
      } catch (err) {
        alert('Failed to delete goal');
        console.error('Error deleting goal:', err);
      }
    }
  };

  const handleUpdateProgress = async (id, newAmount) => {
    try {
      // TODO: Implement update goal progress service
      console.log('Update progress for goal:', id, 'to:', newAmount);
      loadGoals(); // Refresh data
    } catch (err) {
      alert('Failed to update progress');
      console.error('Error updating progress:', err);
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
            onClick={loadGoals}
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
          Financial Goals
        </h1>
        <Button onClick={handleAddGoal} variant="primary">
          + Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Target
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {currency} {totalTarget.toLocaleString()}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Saved
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {currency} {totalCurrent.toLocaleString()}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Goals
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {activeGoals.length}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Completed Goals
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {completedGoals.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Overall Progress
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">{overallProgress.toFixed(1)}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            max={100}
            color={overallProgress >= 100 ? 'green' : overallProgress > 50 ? 'yellow' : 'blue'}
          />
        </div>
      </Card>

      {/* Currency Selector */}
      <div className="flex justify-end">
        <CurrencySelector />
      </div>

      {/* Active Goals */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Goals
        </h3>
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {goal.title}
                      </h4>
                      <Badge color={getPriorityColor(goal.priority)} size="sm">
                        {goal.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {goal.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Category: {goal.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                      {daysLeft > 0 && (
                        <span className="text-yellow-600">
                          {daysLeft} days left
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.currency} {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {progress.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <Progress 
                  value={progress} 
                  max={100}
                  color={progress >= 100 ? 'green' : progress > 50 ? 'yellow' : 'blue'}
                />
                
                <div className="flex justify-end mt-2 space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleEditGoal(goal)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed Goals
          </h3>
          <div className="space-y-4">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {goal.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Completed: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.currency} {goal.targetAmount.toLocaleString()}
                    </p>
                    <Badge color="green" size="sm">
                      Completed
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activities Timeline */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activities
        </h3>
        <Timeline 
          items={[
            {
              content: 'Goal "Dana Darurat" updated',
              date: '2 hours ago',
              variant: 'success'
            },
            {
              content: 'New goal "DP Rumah" created',
              date: '1 day ago',
              variant: 'primary'
            },
            {
              content: 'Goal "Liburan Keluarga" progress updated',
              date: '2 days ago',
              variant: 'warning'
            }
          ]} 
        />
      </Card>

      {/* Add/Edit Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingGoal ? 'Edit Goal' : 'Add Goal'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Emergency Fund"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your goal"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount *
                </label>
                <Input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  placeholder="Enter target amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Amount *
                </label>
                <Input
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                  placeholder="Enter current amount"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline *
                </label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Emergency Fund"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveGoal}>
              {editingGoal ? 'Update' : 'Add'} Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 