'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Check, Users, Gift } from 'lucide-react';

interface ReferralCodeInputProps {
  onCodeApplied?: (success: boolean, message?: string) => void;
  className?: string;
}

export default function ReferralCodeInput({ onCodeApplied, className = '' }: ReferralCodeInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCode = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsApplied(true);
        onCodeApplied?.(true, 'Referral code applied successfully!');
      } else {
        setError(data.error || 'Failed to apply referral code');
        onCodeApplied?.(false, data.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      onCodeApplied?.(false, 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isApplied) {
    return (
      <Card className={`p-4 bg-green-50 border-green-200 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Referral code applied!</p>
            <p className="text-sm text-green-600">You and your friend will both get rewards.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-amber-600" />
          <h3 className="font-medium">Have a referral code?</h3>
        </div>
        
        <p className="text-sm text-slate-600">
          Enter your friend's code to unlock exclusive rewards for both of you.
        </p>

        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter code (e.g., ABC123)"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleApplyCode}
            disabled={!code.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? 'Applying...' : 'Apply'}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Gift className="w-4 h-4" />
          <span>Both you and your friend get 7 days premium access</span>
        </div>
      </div>
    </Card>
  );
}
