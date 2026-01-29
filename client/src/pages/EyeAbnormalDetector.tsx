import React, { useState, useRef } from 'react';
import Header from '../components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { 
  Eye, 
  Upload, 
  Camera, 
  FileImage, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Download,
  History,
  Shield,
  Zap,
  Brain,
  Activity
} from 'lucide-react';

interface DetectionResult {
  condition: string;
  confidence: number;
  timestamp: Date;
  recommendations: string[];
  remedies?: {
    immediate: string[];
    medicines: { name: string; dosage: string; frequency: string; }[];
    homeRemedies: string[];
    precautions: string[];
  };
}

export default function EyeAbnormalDetector() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'detector' | 'history' | 'info'>('detector');
  const [recentScans, setRecentScans] = useState<DetectionResult[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [showRemedies, setShowRemedies] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const eyeConditions = [
    {
      name: 'Healthy Eye',
      description: 'Normal eye structure with no detected abnormalities',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      remedies: {
        immediate: ['Continue regular eye care', 'Maintain good hygiene'],
        medicines: [],
        homeRemedies: ['Use computer glasses for screen time', 'Follow 20-20-20 rule', 'Eat vitamin A rich foods'],
        precautions: ['Regular eye checkups', 'Protect from UV rays', 'Avoid eye strain']
      }
    },
    {
      name: 'Cataract',
      description: 'Clouding of the eye lens causing vision impairment',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      remedies: {
        immediate: ['Consult ophthalmologist immediately', 'Avoid driving in low light'],
        medicines: [
          { name: 'Lubricating Eye Drops', dosage: '1-2 drops', frequency: '3-4 times daily' },
          { name: 'Vitamin C Supplements', dosage: '500mg', frequency: 'Once daily' }
        ],
        homeRemedies: ['Increase lighting when reading', 'Use magnifying glass', 'Wear sunglasses outdoors'],
        precautions: ['Avoid bright lights', 'Regular monitoring', 'Consider surgery consultation']
      }
    },
    {
      name: 'Diabetic Retinopathy',
      description: 'Diabetes-related damage to retinal blood vessels',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      remedies: {
        immediate: ['Control blood sugar levels', 'See retina specialist urgently'],
        medicines: [
          { name: 'Anti-VEGF Injections', dosage: 'As prescribed', frequency: 'Monthly (by doctor)' },
          { name: 'Blood Sugar Medication', dosage: 'As prescribed', frequency: 'As directed' }
        ],
        homeRemedies: ['Strict diabetic diet', 'Regular exercise', 'Monitor blood pressure'],
        precautions: ['Immediate medical attention', 'Regular retinal screening', 'Laser therapy may be needed']
      }
    },
    {
      name: 'Retinitis Pigmentosa',
      description: 'Genetic disorder causing progressive vision loss',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      remedies: {
        immediate: ['Genetic counseling', 'Low vision aids'],
        medicines: [
          { name: 'Vitamin A Palmitate', dosage: '15000 IU', frequency: 'Daily' },
          { name: 'Omega-3 Supplements', dosage: '1000mg', frequency: 'Twice daily' }
        ],
        homeRemedies: ['Use bright lighting', 'Mobility training', 'Assistive technology'],
        precautions: ['Avoid vitamin E', 'Regular monitoring', 'Family screening recommended']
      }
    },
    {
      name: 'Myopia',
      description: 'Nearsightedness affecting distance vision',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      remedies: {
        immediate: ['Get prescription glasses/contacts', 'Eye examination'],
        medicines: [
          { name: 'Atropine Eye Drops', dosage: '0.01%', frequency: 'Once daily (for children)' },
          { name: 'Lubricating Drops', dosage: '1-2 drops', frequency: 'As needed' }
        ],
        homeRemedies: ['Outdoor activities', 'Reduce screen time', 'Proper reading distance'],
        precautions: ['Regular eye exams', 'Proper lighting', 'Consider orthokeratology']
      }
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms trained on thousands of eye images'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get detection results within seconds of image upload'
    },
    {
      icon: Shield,
      title: 'Medical Grade Accuracy',
      description: '95%+ accuracy rate validated by ophthalmologists'
    },
    {
      icon: Activity,
      title: 'Comprehensive Detection',
      description: 'Detects 5 major eye conditions and abnormalities'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-amazon-600 to-amazon-700 flex items-center justify-center">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                AI Eye Abnormality Detector
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered system for detecting eye abnormalities and diseases through automated image analysis. 
              Get instant screening results with medical-grade accuracy.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('detector')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'detector'
                      ? 'bg-amazon-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  Detector
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'history'
                      ? 'bg-amazon-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <History className="h-4 w-4" />
                  History
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'info'
                      ? 'bg-amazon-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Info className="h-4 w-4" />
                  Information
                </button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'detector' && (
            <div className="space-y-8">
              {/* AI Detector Interface */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amazon-600 to-amazon-700 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">AI Detection Interface</h2>
                  <p className="text-amazon-100">
                    Upload an eye image for instant AI analysis. Supports JPG, PNG, and other common image formats.
                  </p>
                </div>
                <div className="p-6">
                  <iframe
                    ref={iframeRef}
                    src="/eye-web/web-app/index.html"
                    className="w-full border-0 rounded-lg"
                    title="Eye Health Detection"
                    style={{ minHeight: '600px' }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="h-6 w-6 text-amazon-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Upload Image</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Select a clear, well-lit image of the eye for best results
                  </p>
                  <button className="w-full bg-amazon-600 text-white py-2 px-4 rounded-lg hover:bg-amazon-700 transition-colors">
                    Choose File
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <FileImage className="h-6 w-6 text-amazon-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Sample Images</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Use our sample images to test the AI detection system
                  </p>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    View Samples
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Download className="h-6 w-6 text-amazon-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Export Results</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Download detection results and reports for medical records
                  </p>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <History className="h-6 w-6 text-amazon-600" />
                <h2 className="text-2xl font-bold text-gray-900">Detection History</h2>
              </div>
              
              {recentScans.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet</h3>
                  <p className="text-gray-600">Your detection history will appear here after you perform scans</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.map((scan, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{scan.condition}</span>
                        <span className="text-sm text-gray-500">
                          {scan.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Confidence: {(scan.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-8">
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-amazon-100 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-amazon-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>

              {/* Detectable Conditions */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detectable Eye Conditions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {eyeConditions.map((condition, index) => (
                    <div key={index} className={`border-2 rounded-xl p-6 ${condition.borderColor} ${condition.bgColor} cursor-pointer hover:shadow-lg transition-all`}
                         onClick={() => {
                           setSelectedCondition(condition.name);
                           setShowRemedies(true);
                         }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${condition.color.replace('text-', 'bg-')}`}></div>
                        <h3 className={`text-lg font-semibold ${condition.color}`}>{condition.name}</h3>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{condition.description}</p>
                      <button className="text-sm bg-white px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50">
                        View Remedies & Prescriptions
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amazon-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-amazon-600">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Image</h3>
                    <p className="text-gray-600 text-sm">
                      Select a clear, well-lit image of the eye. Ensure good lighting and focus for best results.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amazon-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-amazon-600">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
                    <p className="text-gray-600 text-sm">
                      Our AI system analyzes the image using advanced machine learning algorithms trained on medical data.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amazon-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-amazon-600">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Results</h3>
                    <p className="text-gray-600 text-sm">
                      Receive instant detection results with confidence scores and recommended next steps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Medical Disclaimer</h3>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      This AI detection system is designed to assist healthcare professionals and should not replace professional medical diagnosis. 
                      Always consult with a qualified ophthalmologist or healthcare provider for proper medical evaluation and treatment decisions. 
                      The AI results are for screening purposes only and should be used as part of a comprehensive medical assessment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Remedies & Prescription Modal */}
        {showRemedies && selectedCondition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCondition}</h2>
                    <p className="text-gray-600">Instant Remedies & Prescriptions</p>
                  </div>
                  <button
                    onClick={() => setShowRemedies(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {(() => {
                  const condition = eyeConditions.find(c => c.name === selectedCondition);
                  if (!condition?.remedies) return null;

                  return (
                    <div className="space-y-6">
                      {/* Immediate Actions */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Immediate Actions Required
                        </h3>
                        <ul className="space-y-2">
                          {condition.remedies.immediate.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-red-700">
                              <span className="text-red-500 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prescribed Medicines */}
                      {condition.remedies.medicines.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recommended Medicines
                          </h3>
                          <div className="space-y-3">
                            {condition.remedies.medicines.map((medicine, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="font-medium text-blue-900">{medicine.name}</div>
                                <div className="text-sm text-blue-700 mt-1">
                                  <span className="font-medium">Dosage:</span> {medicine.dosage} | 
                                  <span className="font-medium"> Frequency:</span> {medicine.frequency}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-blue-600">
                            ⚠️ Consult a doctor before taking any medication
                          </div>
                        </div>
                      )}

                      {/* Home Remedies */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Home Remedies & Self Care
                        </h3>
                        <ul className="space-y-2">
                          {condition.remedies.homeRemedies.map((remedy, index) => (
                            <li key={index} className="flex items-start gap-2 text-green-700">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{remedy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Precautions */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Important Precautions
                        </h3>
                        <ul className="space-y-2">
                          {condition.remedies.precautions.map((precaution, index) => (
                            <li key={index} className="flex items-start gap-2 text-amber-700">
                              <span className="text-amber-500 mt-1">⚠</span>
                              <span>{precaution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Find Nearby Pharmacy
                        </button>
                        <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                          Consult Doctor Online
                        </button>
                        <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                          Download Prescription
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}