import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { userService, backendUtils } from '../services/backend';
import CurrencySelector from '../components/CurrencySelector.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card from '../components/Card.jsx';
import Avatar from '../components/Avatar.jsx';
import Switch from '../components/Switch.jsx';
import Badge from '../components/Badge.jsx';

export default function SettingsPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [settings, setSettings] = useState({
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
    autoSync: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load profile and settings from backend
  const loadProfileAndSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load user profile
      const profileResult = await userService.getUserSummary();
      if (profileResult.success) {
        setProfile(prev => ({
          ...prev,
          name: profileResult.data?.name || '',
          email: profileResult.data?.email || ''
        }));
      }

      // TODO: Load user settings from backend
      // For now, we'll use default settings
    } catch (err) {
      setError('Failed to load profile and settings');
      console.error('Error loading profile and settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileAndSettings();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // TODO: Implement update profile service
      console.log('Saving profile:', profile);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement update settings service
      console.log('Saving settings:', settings);
      alert('Settings updated successfully!');
    } catch (err) {
      alert('Failed to update settings');
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await backendUtils.logout();
      // Redirect will be handled by AuthContext
    } catch (err) {
      alert('Failed to logout');
      console.error('Error logging out:', err);
    }
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
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
            onClick={loadProfileAndSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Settings & Profile</h2>
      
      {/* Profile Section */}
      <Card className="mb-4">
        <div className="font-semibold mb-4">Profile</div>
        <div className="flex items-center gap-4 mb-4">
          <Avatar 
            initials={profile?.name?.charAt(0) || 'U'} 
            size="lg"
          />
          <div className="flex-1">
            <Input 
              placeholder="Display Name" 
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="mb-2 w-full"
            />
            <Input 
              type="email"
              placeholder="Email" 
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full"
            />
          </div>
        </div>
        <Button onClick={handleSaveProfile} loading={saving}>
          Save Profile
        </Button>
      </Card>

      {/* Preferences Section */}
      <Card className="mb-4">
        <div className="font-semibold mb-4">Preferences</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Currency
              </label>
              <p className="text-xs text-gray-500">Choose your preferred currency</p>
            </div>
            <CurrencySelector />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <p className="text-xs text-gray-500">Light or dark mode</p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {settings.theme === 'dark' ? 'Dark' : 'Light'}
            </Button>
          </div>
        </div>
        <Button onClick={handleSaveSettings} loading={saving} className="mt-4">
          Save Preferences
        </Button>
      </Card>

      {/* Notifications Section */}
      <Card className="mb-4">
        <div className="font-semibold mb-4">Notifications</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Notifications
              </label>
              <p className="text-xs text-gray-500">Receive updates via email</p>
            </div>
            <Switch 
              checked={settings.emailNotifications}
              onChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Push Notifications
              </label>
              <p className="text-xs text-gray-500">Receive real-time alerts</p>
            </div>
            <Switch 
              checked={settings.pushNotifications}
              onChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto Sync
              </label>
              <p className="text-xs text-gray-500">Automatically sync data</p>
            </div>
            <Switch 
              checked={settings.autoSync}
              onChange={(checked) => setSettings(prev => ({ ...prev, autoSync: checked }))}
            />
          </div>
        </div>
        <Button onClick={handleSaveSettings} loading={saving} className="mt-4">
          Save Notifications
        </Button>
      </Card>

      {/* Security Section */}
      <Card className="mb-4">
        <div className="font-semibold mb-4">Security</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Two-Factor Authentication
              </label>
              <p className="text-xs text-gray-500">Add an extra layer of security</p>
            </div>
            <Badge color="yellow" size="sm">Not Enabled</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Management
              </label>
              <p className="text-xs text-gray-500">Manage active sessions</p>
            </div>
            <Button variant="secondary" size="sm">
              Manage
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-4">
        <div className="font-semibold mb-4">Data Management</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Data
              </label>
              <p className="text-xs text-gray-500">Download your financial data</p>
            </div>
            <Button variant="secondary" size="sm">
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Delete Account
              </label>
              <p className="text-xs text-gray-500">Permanently delete your account</p>
            </div>
            <Button variant="danger" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card>
        <div className="font-semibold mb-4">Account Actions</div>
        <div className="space-y-2">
          <Button variant="danger" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
} 