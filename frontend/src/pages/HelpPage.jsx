import React from 'react';
import Card from '../components/Card.jsx';
import Accordion from '../components/Accordion.jsx';

export default function HelpPage() {
  const faqItems = [
    {
      title: 'How to connect my wallet?',
      content: 'Go to the Wallets page and click "Connect" on your desired wallet (BTC, ETH, SOL). Then approve the connection in your wallet extension/app.'
    },
    {
      title: 'How to add a transaction?',
      content: 'Click the "+ Add Transaction" button on the Dashboard or Transactions page. Fill in the details and click Save.'
    },
    {
      title: 'How to export my data?',
      content: 'Go to the Transactions page and click "Export CSV" to download your transaction data.'
    }
  ];

  const tutorialItems = [
    {
      title: 'Getting Started',
      content: '1. Sign in with Internet Identity\n2. Connect your wallets\n3. Add your first transaction\n4. Explore the dashboard and analytics.'
    },
    {
      title: 'Wallet Connection',
      content: '1. Go to the Wallets page\n2. Click "Connect" on your desired wallet (BTC, ETH, SOL)\n3. Approve connection in your wallet extension/app\n4. Your wallet address and balance will be displayed.'
    },
    {
      title: 'Portfolio Management',
      content: 'View your asset allocation, track portfolio performance, and get insights from the Portfolio and Analytics pages.'
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Help & About</h2>
      
      <Card className="mb-4">
        <div className="font-semibold mb-4">Frequently Asked Questions</div>
        <Accordion items={faqItems} />
      </Card>
      
      <Card className="mb-4">
        <div className="font-semibold mb-4">Tutorials</div>
        <Accordion items={tutorialItems} allowMultiple={true} />
      </Card>
      
      <Card className="mb-4">
        <div className="font-semibold mb-2">Version Info</div>
        <div>FinTrack v2.0.0</div>
      </Card>
      
      <Card>
        <a href="https://github.com/demigohu/FinTrack" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">GitHub Repository</a>
      </Card>
    </div>
  );
} 