'use client';

import { useState } from 'react';
import { Download, Trash2, AlertTriangle, Check } from 'lucide-react';

export default function DataPrivacy() {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      const response = await fetch('/api/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feelsharper-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          confirmDelete: true,
          hardDelete: deleteType === 'hard'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Deletion failed');
      }

      // Redirect to homepage after successful deletion
      alert(data.message);
      window.location.href = '/';
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
           style={{
             clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
           }}>
        <h3 className="text-lg font-title font-bold text-white mb-2">Export Your Data</h3>
        <p className="text-sm text-sharpened-light-gray font-body mb-4">
          Download all your FeelSharper data including workouts, meals, insights, and preferences in JSON format.
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="sharp-button px-6 py-2 bg-sharpened-charcoal hover:bg-sharpened-charcoal/70 text-white font-body font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Exporting...
            </>
          ) : exportSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export My Data
            </>
          )}
        </button>
      </div>

      {/* Account Deletion */}
      <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-red-500/30 p-6"
           style={{
             clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
           }}>
        <h3 className="text-lg font-title font-bold text-red-400 mb-2">Delete Account</h3>
        <p className="text-sm text-sharpened-light-gray font-body mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="sharp-button px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-body font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30"
                 style={{
                   clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                 }}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-body font-semibold text-red-300">
                    Are you absolutely sure?
                  </p>
                  <p className="text-sm text-red-400/80 font-body">
                    This will delete your account and all your data. This action cannot be reversed.
                  </p>
                </div>
              </div>
            </div>

            {/* Deletion type selection */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border border-sharpened-charcoal cursor-pointer hover:bg-sharpened-charcoal/20 transition-colors"
                     style={{
                       clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                     }}>
                <input
                  type="radio"
                  name="deleteType"
                  value="soft"
                  checked={deleteType === 'soft'}
                  onChange={(e) => setDeleteType(e.target.value as 'soft' | 'hard')}
                  className="mt-1"
                />
                <div>
                  <div className="font-body font-semibold text-sm text-white">Deactivate Account</div>
                  <div className="text-xs text-sharpened-gray font-body">
                    Your account will be deactivated and data retained for 30 days in case you change your mind.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border border-red-500/50 cursor-pointer hover:bg-red-500/10 transition-colors"
                     style={{
                       clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                     }}>
                <input
                  type="radio"
                  name="deleteType"
                  value="hard"
                  checked={deleteType === 'hard'}
                  onChange={(e) => setDeleteType(e.target.value as 'soft' | 'hard')}
                  className="mt-1"
                />
                <div>
                  <div className="font-body font-semibold text-sm text-red-400">Permanently Delete</div>
                  <div className="text-xs text-sharpened-gray font-body">
                    Immediately and permanently delete all data. This cannot be undone.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 sharp-button px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-body font-semibold transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Deleting...
                  </>
                ) : (
                  `Yes, ${deleteType === 'hard' ? 'Permanently ' : ''}Delete My Account`
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 sharp-button px-4 py-2 bg-sharpened-charcoal hover:bg-sharpened-charcoal/70 text-white font-body font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}