'use client';

import { useState, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Camera,
  Calendar,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Download,
  Share2,
  Eye,
  EyeOff,
  Filter,
  Zap,
  Target,
  Ruler,
  Scale
} from 'lucide-react';

interface ProgressPhoto {
  id: string;
  date: string;
  photoUrl: string;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes?: string;
  visibility: 'private' | 'friends' | 'public';
}

// Mock data - in production this would come from Supabase
const mockPhotos: ProgressPhoto[] = [
  {
    id: '1',
    date: '2025-02-11',
    photoUrl: '📸',
    weight: 185.2,
    bodyFat: 18.5,
    measurements: { chest: 42, waist: 34, arms: 15.5 },
    notes: 'Starting to see definition in abs',
    visibility: 'private'
  },
  {
    id: '2',
    date: '2025-02-04',
    photoUrl: '📷',
    weight: 186.8,
    bodyFat: 19.2,
    measurements: { chest: 41.5, waist: 34.5, arms: 15 },
    notes: 'First photo after cutting phase started',
    visibility: 'private'
  },
  {
    id: '3',
    date: '2025-01-28',
    photoUrl: '📹',
    weight: 188.1,
    bodyFat: 20.1,
    measurements: { chest: 41, waist: 35, arms: 14.8 },
    notes: 'End of bulk, ready to start cut',
    visibility: 'friends'
  },
  {
    id: '4',
    date: '2025-01-14',
    photoUrl: '🎥',
    weight: 187.5,
    bodyFat: 19.8,
    measurements: { chest: 40.8, waist: 35.2, arms: 14.5 },
    notes: 'Mid-bulk progress check',
    visibility: 'private'
  }
];

export function ProgressPhotoComparison() {
  const [photos] = useState<ProgressPhoto[]>(mockPhotos);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([photos[0]?.id, photos[1]?.id]);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'timeline'>('side-by-side');
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<'all' | '30days' | '90days'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPhotos = photos.filter(photo => {
    if (filterPeriod === 'all') return true;
    
    const photoDate = new Date(photo.date);
    const cutoffDate = new Date();
    const days = filterPeriod === '30days' ? 30 : 90;
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return photoDate >= cutoffDate;
  });

  const selectedPhotoData = selectedPhotos.map(id => 
    photos.find(p => p.id === id)
  ).filter(Boolean) as ProgressPhoto[];

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In production, this would upload to storage and save to database
      console.log('Uploading photo:', file.name);
    }
  };

  const calculateChange = (metric: keyof ProgressPhoto, photoIndex: number = 0) => {
    if (selectedPhotoData.length < 2) return null;
    
    const latest = selectedPhotoData[0];
    const comparison = selectedPhotoData[photoIndex + 1] || selectedPhotoData[1];
    
    if (metric === 'weight') {
      const change = (latest.weight || 0) - (comparison.weight || 0);
      return {
        value: Math.abs(change),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        unit: 'lbs'
      };
    }
    
    if (metric === 'bodyFat') {
      const change = (latest.bodyFat || 0) - (comparison.bodyFat || 0);
      return {
        value: Math.abs(change),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        unit: '%'
      };
    }
    
    return null;
  };

  const getChangeColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Progress Photos
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Visual tracking of your transformation journey
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handlePhotoUpload} className="gap-2">
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Filter & View Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filterPeriod === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterPeriod('all')}
            >
              All Time
            </Button>
            <Button
              variant={filterPeriod === '90days' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterPeriod('90days')}
            >
              90 Days
            </Button>
            <Button
              variant={filterPeriod === '30days' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterPeriod('30days')}
            >
              30 Days
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'side-by-side' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('side-by-side')}
            >
              Side by Side
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMeasurements(!showMeasurements)}
            >
              {showMeasurements ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      {selectedPhotoData.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Scale className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Weight Change</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {(() => {
                const change = calculateChange('weight');
                return change ? (
                  <span className={getChangeColor(change.direction)}>
                    {change.direction === 'down' ? '-' : change.direction === 'up' ? '+' : ''}
                    {change.value.toFixed(1)} {change.unit}
                  </span>
                ) : 'N/A';
              })()}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Body Fat</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {(() => {
                const change = calculateChange('bodyFat');
                return change ? (
                  <span className={getChangeColor(change.direction)}>
                    {change.direction === 'down' ? '-' : change.direction === 'up' ? '+' : ''}
                    {change.value.toFixed(1)}%
                  </span>
                ) : 'N/A';
              })()}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Time Period</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {(() => {
                if (selectedPhotoData.length < 2) return 'N/A';
                const days = Math.ceil(
                  (new Date(selectedPhotoData[0].date).getTime() - 
                   new Date(selectedPhotoData[1].date).getTime()) / (1000 * 60 * 60 * 24)
                );
                return `${days} days`;
              })()}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Progress</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 text-green-600">
              Consistent 💪
            </div>
          </Card>
        </div>
      )}

      {/* Main Comparison View */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedPhotoData.slice(0, 2).map((photo, index) => (
            <Card key={photo.id} className="overflow-hidden">
              {/* Photo Display */}
              <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-8xl">
                {photo.photoUrl}
              </div>
              
              {/* Photo Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {new Date(photo.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <Badge className={`text-xs ${
                    photo.visibility === 'private' ? 'bg-red-100 text-red-800' :
                    photo.visibility === 'friends' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {photo.visibility}
                  </Badge>
                </div>
                
                {showMeasurements && (
                  <div className="space-y-2 text-sm">
                    {photo.weight && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Weight:</span>
                        <span className="font-medium">{photo.weight} lbs</span>
                      </div>
                    )}
                    {photo.bodyFat && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Body Fat:</span>
                        <span className="font-medium">{photo.bodyFat}%</span>
                      </div>
                    )}
                    {photo.measurements && (
                      <>
                        {photo.measurements.chest && (
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Chest:</span>
                            <span className="font-medium">{photo.measurements.chest}"</span>
                          </div>
                        )}
                        {photo.measurements.waist && (
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Waist:</span>
                            <span className="font-medium">{photo.measurements.waist}"</span>
                          </div>
                        )}
                        {photo.measurements.arms && (
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Arms:</span>
                            <span className="font-medium">{photo.measurements.arms}"</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {photo.notes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {photo.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <Card className="p-6">
          <div className="space-y-6">
            {filteredPhotos.map((photo, index) => (
              <div key={photo.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
                    {photo.photoUrl}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {new Date(photo.date).toLocaleDateString()}
                    </h3>
                    <Badge variant="secondary">{photo.visibility}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                    {photo.weight && (
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Weight: </span>
                        <span className="font-medium">{photo.weight} lbs</span>
                      </div>
                    )}
                    {photo.bodyFat && (
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">BF: </span>
                        <span className="font-medium">{photo.bodyFat}%</span>
                      </div>
                    )}
                    {photo.measurements?.chest && (
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Chest: </span>
                        <span className="font-medium">{photo.measurements.chest}"</span>
                      </div>
                    )}
                    {photo.measurements?.waist && (
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Waist: </span>
                        <span className="font-medium">{photo.measurements.waist}"</span>
                      </div>
                    )}
                  </div>
                  
                  {photo.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                      {photo.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="sm">
                    Compare
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Photo Selection Grid */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Select Photos to Compare
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredPhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => {
                if (selectedPhotos.includes(photo.id)) {
                  setSelectedPhotos(selectedPhotos.filter(id => id !== photo.id));
                } else if (selectedPhotos.length < 2) {
                  setSelectedPhotos([...selectedPhotos, photo.id]);
                } else {
                  setSelectedPhotos([selectedPhotos[1], photo.id]);
                }
              }}
              className={`relative aspect-[3/4] rounded-lg border-2 transition-all ${
                selectedPhotos.includes(photo.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
                {photo.photoUrl}
              </div>
              
              {selectedPhotos.includes(photo.id) && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedPhotos.indexOf(photo.id) + 1}
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                {new Date(photo.date).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}