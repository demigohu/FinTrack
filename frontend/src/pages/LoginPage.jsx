import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';

export default function LoginPage() {
  const { handleLogin } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleLogin();
    } catch (e) {
      setError('Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <img src="/logo.svg" alt="FinTrack Logo" className="h-16 mb-6" />
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sign in to FinTrack</h1>
      <Button
        onClick={onLogin}
        loading={loading}
        size="lg"
        className="mb-4"
      >
        Sign in with Internet Identity
      </Button>
      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
} 