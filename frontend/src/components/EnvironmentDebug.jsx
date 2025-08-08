import React, { useState, useEffect } from 'react';
import { authService } from '../services/backend';

export default function EnvironmentDebug() {
  const [config, setConfig] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load configuration
    const envInfo = authService.getEnvironmentInfo();
    setConfig(envInfo);

    // Check backend status
    const checkBackendStatus = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        setBackendStatus({
          connected: true,
          authenticated: isAuth,
          error: null,
          environment: envInfo
        });
      } catch (error) {
        setBackendStatus({
          connected: false,
          authenticated: false,
          error: error.message,
          environment: envInfo
        });
      }
    };
    checkBackendStatus();
  }, []);

  if (!config) {
    return <div>Loading environment configuration...</div>;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Environment Debug
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isExpanded ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">Network</div>
          <div className="font-medium text-gray-900 dark:text-white">
            {config.network}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">Environment</div>
          <div className="font-medium text-gray-900 dark:text-white">
            {config.isLocal ? 'Local' : 'IC'}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">Backend Status</div>
          <div className={`font-medium ${backendStatus?.connected ? 'text-green-600' : 'text-red-600'}`}>
            {backendStatus?.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Authentication Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          backendStatus?.authenticated 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {backendStatus?.authenticated ? '✓ Authenticated' : '⚠ Not Authenticated'}
        </div>
      </div>

      {/* Detailed Configuration */}
      {isExpanded && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-700 rounded p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Network Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Network:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{config.network}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Identity Provider:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                  {config.identityProvider}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Canister ID:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                  {config.canisterId}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Is Local:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {config.isLocal ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {backendStatus && (
            <div className="bg-white dark:bg-gray-700 rounded p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Backend Status</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Connected:</span>
                  <span className={`ml-2 font-medium ${backendStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {backendStatus.connected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Authenticated:</span>
                  <span className={`ml-2 font-medium ${backendStatus.authenticated ? 'text-green-600' : 'text-yellow-600'}`}>
                    {backendStatus.authenticated ? 'Yes' : 'No'}
                  </span>
                </div>
                {backendStatus.error && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Error:</span>
                    <span className="ml-2 text-red-600 dark:text-red-400">{backendStatus.error}</span>
                  </div>
                )}
                {backendStatus.environment && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Environment:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {JSON.stringify(backendStatus.environment, null, 2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-700 rounded p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
            <div className="space-x-2">
              <button
                onClick={() => console.log('Environment Info:', config)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Log to Console
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 