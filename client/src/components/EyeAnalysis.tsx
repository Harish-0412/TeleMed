import { useState, useRef, useEffect } from 'react';
import { AlertCircle, Eye, Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AnalysisResult {
  condition: string;
  confidence: number;
  description: string;
  recommendation: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export default function EyeAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setError('');
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyzeEyeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/analyze-eye', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'text-yellow-600 bg-yellow-50';
      case 'moderate':
        return 'text-orange-600 bg-orange-50';
      case 'severe':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Eye className="w-8 h-8 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Eye Health Analysis</h2>
      </div>

      {/* Upload Section */}
      <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-gray-600 font-medium">
              Click to upload eye photo or video frame
            </span>
            <span className="text-sm text-gray-500">
              PNG, JPG, GIF up to 10MB
            </span>
          </button>

          {preview && (
            <div className="space-y-3">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={analyzeEyeImage}
                  disabled={analyzing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Analyze Eye
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setPreview('');
                    setSelectedFile(null);
                    setResults(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {results && (
        <Card className={`p-6 ${getSeverityColor(results.severity)}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Analysis Results</h3>
              <span className={`px-3 py-1 rounded-full font-semibold text-sm uppercase ${getSeverityColor(results.severity)}`}>
                {results.severity}
              </span>
            </div>

            <div className="space-y-3 text-gray-900">
              <div>
                <p className="font-semibold text-sm text-gray-700">Detected Condition:</p>
                <p className="text-lg">{results.condition}</p>
              </div>

              <div>
                <p className="font-semibold text-sm text-gray-700">Confidence Score:</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${results.confidence * 100}%` }}
                    />
                  </div>
                  <span className="font-bold whitespace-nowrap">
                    {(results.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm text-gray-700">Description:</p>
                <p>{results.description}</p>
              </div>

              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-semibold text-sm text-gray-700 mb-1">Recommendation:</p>
                <p className="text-sm">{results.recommendation}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-current/20">
              <p className="text-xs text-gray-600">
                ⚠️ This analysis is for screening purposes only. Please consult with an eye specialist for professional diagnosis and treatment.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">What can this detect?</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Cataracts and lens opacities</li>
          <li>• Conjunctivitis and infections</li>
          <li>• Corneal abnormalities</li>
          <li>• Pterygium (tissue growth)</li>
          <li>• General eye health indicators</li>
        </ul>
      </Card>
    </div>
  );
}
