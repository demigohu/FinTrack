import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/backend';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Divider from '../components/Divider.jsx';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showRead, setShowRead] = useState(true);

  // Load notifications from backend
  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await notificationService.getNotifications(null, showRead);
      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [showRead]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'danger': return 'red';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'budget': return '💰';
      case 'goal': return '🎯';
      case 'transaction': return '💸';
      case 'market': return '📈';
      case 'payment': return '💳';
      case 'ai': return '🤖';
      default: return '📢';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      const result = await notificationService.markAsRead(id);
      if (result.success) {
        loadNotifications(); // Refresh data
      } else {
        alert(result.error || 'Failed to mark as read');
      }
    } catch (err) {
      alert('Failed to mark as read');
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Implement mark all as read service
      console.log('Mark all as read');
      loadNotifications(); // Refresh data
    } catch (err) {
      alert('Failed to mark all as read');
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        // TODO: Implement delete notification service
        console.log('Delete notification:', id);
        loadNotifications(); // Refresh data
      } catch (err) {
        alert('Failed to delete notification');
        console.error('Error deleting notification:', err);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      try {
        // TODO: Implement delete all notifications service
        console.log('Delete all notifications');
        loadNotifications(); // Refresh data
      } catch (err) {
        alert('Failed to delete all notifications');
        console.error('Error deleting all notifications:', err);
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
            onClick={loadNotifications}
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
          Notifications
        </h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
          <Button variant="danger" onClick={handleDeleteAll}>
            Delete All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Notifications
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {notifications.length}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unread
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {unreadCount}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Read
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {readCount}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="budget">Budget</option>
            <option value="goal">Goal</option>
            <option value="transaction">Transaction</option>
            <option value="market">Market</option>
            <option value="payment">Payment</option>
            <option value="ai">AI</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showRead"
            checked={showRead}
            onChange={(e) => setShowRead(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showRead" className="text-sm text-gray-700 dark:text-gray-300">
            Show read notifications
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notifications
        </h3>
        
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`border rounded-lg p-4 ${
                  notification.isRead 
                    ? 'bg-gray-50 dark:bg-gray-800' 
                    : 'bg-white dark:bg-gray-700 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(notification.category)}</span>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <Badge color={getTypeColor(notification.type)} size="sm">
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <Badge color="blue" size="sm">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 capitalize">
                        {notification.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {!notification.isRead && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 