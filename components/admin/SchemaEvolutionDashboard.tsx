'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SchemaRecommendation {
  id: string;
  field: string;
  dataType: string;
  reasoning: string;
  impact: 'low' | 'medium' | 'high';
  affectedUsers: number;
  confidence: number;
  sqlCode: string;
  rollbackSql: string;
  requiresApproval: boolean;
}

interface SchemaEvolutionRequest {
  id: string;
  recommendations: SchemaRecommendation[];
  totalAffectedUsers: number;
  confidenceScore: number;
  status: 'pending' | 'admin_review_required' | 'approved' | 'rejected' | 'implemented';
  createdAt: string;
  reviewedBy?: string;
  implementedAt?: string;
  sqlPreview: string;
  rollbackScript: string;
}

export function SchemaEvolutionDashboard() {
  const [requests, setRequests] = useState<SchemaEvolutionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SchemaEvolutionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('schema_evolution_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests: SchemaEvolutionRequest[] = data.map(item => ({
        id: item.id,
        recommendations: item.proposed_changes || [],
        totalAffectedUsers: item.affected_users,
        confidenceScore: item.confidence_score,
        status: item.status,
        createdAt: item.created_at,
        reviewedBy: item.reviewed_by,
        implementedAt: item.implemented_at,
        sqlPreview: item.sql_preview || '',
        rollbackScript: item.rollback_script || ''
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Failed to load schema requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('schema_evolution_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin' // In production, use actual admin user ID
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log approval in audit trail
      await supabase
        .from('schema_evolution_audit')
        .insert({
          request_id: requestId,
          action: 'approved',
          admin_id: 'admin', // In production, use actual admin user ID
          decision_reasoning: 'Admin approved schema evolution request',
          timestamp: new Date().toISOString()
        });

      await loadRequests();
      alert('✅ Request approved! Admin can now implement the SQL changes manually.');
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('❌ Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('schema_evolution_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          rejection_reason: reason
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log rejection in audit trail
      await supabase
        .from('schema_evolution_audit')
        .insert({
          request_id: requestId,
          action: 'rejected',
          admin_id: 'admin',
          decision_reasoning: reason,
          timestamp: new Date().toISOString()
        });

      await loadRequests();
      alert('✅ Request rejected');
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('❌ Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkImplemented = async (requestId: string, notes: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('schema_evolution_requests')
        .update({
          status: 'implemented',
          implemented_at: new Date().toISOString(),
          implementation_notes: notes
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log implementation in audit trail
      await supabase
        .from('schema_evolution_audit')
        .insert({
          request_id: requestId,
          action: 'implemented',
          admin_id: 'admin',
          decision_reasoning: notes,
          timestamp: new Date().toISOString()
        });

      await loadRequests();
      alert('✅ Marked as implemented');
    } catch (error) {
      console.error('Failed to mark as implemented:', error);
      alert('❌ Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'admin_review_required':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 font-bold';
      case 'medium':
        return 'text-yellow-600 font-medium';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading schema evolution requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔐 Secure Schema Evolution Dashboard
        </h1>
        <p className="text-gray-600">
          AI-generated database recommendations for admin review and approval
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {requests.filter(r => r.status === 'pending' || r.status === 'admin_review_required').length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {requests.filter(r => r.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {requests.filter(r => r.status === 'implemented').length}
          </div>
          <div className="text-sm text-gray-600">Implemented</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-600">
            {requests.reduce((sum, r) => sum + r.totalAffectedUsers, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Users Affected</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Schema Evolution Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Request {request.id.slice(0, 8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Recommendations:</span>
                    <span className="font-medium">{request.recommendations.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confidence:</span>
                    <span className="font-medium">{Math.round(request.confidenceScore * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Affected Users:</span>
                    <span className="font-medium">{request.totalAffectedUsers}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {request.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{rec.field}</span>
                      <span className={`ml-2 ${getImpactColor(rec.impact)}`}>
                        ({rec.impact} impact)
                      </span>
                    </div>
                  ))}
                  {request.recommendations.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{request.recommendations.length - 3} more recommendations
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    Review Details
                  </Button>

                  {request.status === 'pending' || request.status === 'admin_review_required' ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={processing}
                        onClick={() => handleApprove(request.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={processing}
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) handleReject(request.id, reason);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  ) : request.status === 'approved' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={processing}
                      onClick={() => {
                        const notes = prompt('Implementation notes:');
                        if (notes) handleMarkImplemented(request.id, notes);
                      }}
                    >
                      Mark Implemented
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}

            {requests.length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  No schema evolution requests found
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div>
          {selectedRequest ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Request Details</h2>
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Overview</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div>ID: {selectedRequest.id}</div>
                      <div>Status: {selectedRequest.status}</div>
                      <div>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</div>
                      <div>Confidence: {Math.round(selectedRequest.confidenceScore * 100)}%</div>
                      <div>Affected Users: {selectedRequest.totalAffectedUsers}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <div className="space-y-3">
                      {selectedRequest.recommendations.map((rec, idx) => (
                        <div key={idx} className="border rounded p-3">
                          <div className="font-medium">{rec.field}</div>
                          <div className="text-sm text-gray-600 mt-1">{rec.reasoning}</div>
                          <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                            <span>Type: {rec.dataType}</span>
                            <span className={getImpactColor(rec.impact)}>Impact: {rec.impact}</span>
                            <span>Confidence: {Math.round(rec.confidence * 100)}%</span>
                            <span>Users: {rec.affectedUsers}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">🔧 Generated SQL</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono overflow-x-auto">
                      <pre>{selectedRequest.sqlPreview}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">🔄 Rollback Script</h3>
                    <div className="bg-red-50 border border-red-200 p-4 rounded text-xs font-mono overflow-x-auto">
                      <pre>{selectedRequest.rollbackScript}</pre>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <div className="text-yellow-800 font-medium mb-2">⚠️ Implementation Instructions</div>
                    <div className="text-sm text-yellow-700">
                      1. Review the SQL code above for security and correctness<br/>
                      2. Test the changes in a staging environment first<br/>
                      3. Execute the SQL manually in your database admin tool<br/>
                      4. Mark as "Implemented" once changes are live<br/>
                      5. Keep the rollback script ready in case of issues
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Request Details</h2>
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  Select a request from the list to view details
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="mt-8 p-6 bg-green-50 border-green-200">
        <div className="text-green-800">
          <h3 className="font-semibold mb-2">🔐 Security Features Active</h3>
          <ul className="text-sm space-y-1">
            <li>✅ No automatic SQL execution</li>
            <li>✅ All field names validated and sanitized</li>
            <li>✅ JSONB approach eliminates SQL injection risks</li>
            <li>✅ Row-Level Security protecting user data</li>
            <li>✅ Complete audit trail maintained</li>
            <li>✅ Admin approval required for all changes</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}