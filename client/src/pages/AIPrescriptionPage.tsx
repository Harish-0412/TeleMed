import React, { useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Pill, ArrowRight, Activity, AlertCircle, Send, ArrowLeft, FileText, Download } from 'lucide-react';

interface PatientData {
  name: string;
  symptoms: string[];
  temperature: string;
  duration: string;
  age: string;
  gender: string;
  bloodPressure?: string;
  heartRate?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIPrescriptionPage() {
  const [view, setView] = useState<'menu' | 'form' | 'chat' | 'report'>('menu');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultationReport, setConsultationReport] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [temperature, setTemperature] = useState('');
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [error, setError] = useState('');

  const symptomsList = [
    'Fever', 'Cough', 'Cold', 'Headache', 'Body pain', 'Sore throat',
    'Vomiting', 'Diarrhea', 'Fatigue', 'Breathing difficulty', 'Nausea', 'Dizziness'
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter patient name');
      return;
    }
    if (symptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }
    if (!age || !gender) {
      setError('Please fill in all required fields');
      return;
    }

    const data = { name, symptoms, temperature, duration, age, gender, bloodPressure, heartRate };
    setPatientData(data);
    setView('chat');
    initializeChat(data);
  };

  const initializeChat = (data: PatientData) => {
    const initialMessage: Message = {
      role: 'assistant',
      content: `Hello! I'm your AI medical assistant. I see that ${data.name} has the following symptoms: ${data.symptoms.join(', ')}. ${data.temperature ? `Temperature: ${data.temperature}°F. ` : ''}${data.duration ? `Duration: ${data.duration} days. ` : ''}I'm here to provide medical guidance and prescription recommendations. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || 'your-groq-api-key';
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a medical AI assistant helping ASHA (Accredited Social Health Activist) workers provide healthcare guidance to rural patients. Patient details: Name: ${patientData?.name}, Age: ${patientData?.age}, Gender: ${patientData?.gender}, Symptoms: ${patientData?.symptoms.join(', ')}, Temperature: ${patientData?.temperature || 'Not provided'}, Duration: ${patientData?.duration || 'Not provided'} days, Blood Pressure: ${patientData?.bloodPressure || 'Not provided'}, Heart Rate: ${patientData?.heartRate || 'Not provided'}. Provide clear, practical medical guidance for ASHA workers to help them assist patients. Write in simple, conversational language without using asterisks, bullet points, or markdown formatting. Focus on actionable advice for the healthcare worker, not the patient directly. Always recommend consulting a doctor for serious concerns.`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: input
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Groq API:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment or consult with a healthcare professional directly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const highlightImportantText = (text: string) => {
    const importantKeywords = [
      'medicine', 'medicines', 'medication', 'medications', 'prescription', 'prescriptions',
      'doctor', 'physician', 'hospital', 'clinic', 'emergency', 'urgent', 'immediate',
      'paracetamol', 'ibuprofen', 'aspirin', 'antibiotic', 'antibiotics',
      'visit doctor', 'see doctor', 'consult doctor', 'medical attention',
      'serious', 'critical', 'severe', 'danger', 'warning', 'alert',
      'dosage', 'dose', 'mg', 'ml', 'tablet', 'tablets', 'capsule', 'capsules',
      'twice daily', 'three times', 'once daily', 'every', 'hours'
    ];
    
    let highlightedText = text;
    importantKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="bg-yellow-200 text-yellow-800 px-1 rounded font-semibold">${keyword}</span>`);
    });
    
    return highlightedText;
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || 'your-groq-api-key';
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'Generate a comprehensive medical consultation report for a doctor. Include patient details, symptoms, vital signs, conversation summary, recommendations, and follow-up instructions. Format it professionally for medical records without using asterisks, bullet points, or markdown formatting. Write in plain text with clear paragraphs.'
            },
            {
              role: 'user',
              content: `Generate a detailed medical consultation report for:\n\nPatient: ${patientData?.name}\nAge: ${patientData?.age}\nGender: ${patientData?.gender}\nSymptoms: ${patientData?.symptoms.join(', ')}\nTemperature: ${patientData?.temperature || 'Not recorded'}°F\nDuration: ${patientData?.duration || 'Not specified'} days\nBlood Pressure: ${patientData?.bloodPressure || 'Not recorded'}\nHeart Rate: ${patientData?.heartRate || 'Not recorded'}\n\nConsultation Summary:\n${messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}\n\nPlease format this as a professional medical report for the attending physician.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      const report = data.choices[0]?.message?.content || 'Error generating report';
      setConsultationReport(report);
      setView('report');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'menu') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-4xl mx-auto py-20">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-amazon-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Pill className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                E-Prescription & Pharmacy Services
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Digital prescription system with AI assistance and local pharmacy integration
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div 
                onClick={() => setView('form')}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 transform hover:scale-105"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amazon-600 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Prescription Assistant
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Get AI-powered prescription recommendations based on patient symptoms and medical history.
                </p>
                <div className="flex items-center text-amazon-600 font-medium">
                  Start AI Assistant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>

              <Link href="/pharmacy">
                <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-amazon-700 rounded-lg flex items-center justify-center">
                      <Pill className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Find Nearby Pharmacies
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Locate nearby pharmacies and check medication availability in your area.
                  </p>
                  <div className="flex items-center text-amazon-600 font-medium">
                    Find Pharmacies
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </div>

            <div className="mt-12 text-center">
              <Link href="/">
                <Button variant="outline" className="border-amazon-600 text-amazon-600 hover:bg-amazon-50">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === 'form') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Button 
                  onClick={() => setView('menu')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Activity className="text-amazon-600" size={32} />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  AI Prescription Assistant
                </h1>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter patient's full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Select Symptoms <span className="text-red-500">*</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {symptomsList.map(symptom => (
                      <label
                        key={symptom}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-amazon-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={symptoms.includes(symptom)}
                          onChange={() => handleSymptomToggle(symptom)}
                          className="w-5 h-5 text-amazon-600 rounded focus:ring-2 focus:ring-amazon-500"
                        />
                        <span className="text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="e.g., 98.6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration of Symptoms (days)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure (mmHg)
                    </label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      placeholder="e.g., 120/80"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      placeholder="e.g., 72"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g., 35"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-amazon-600 hover:bg-amazon-700 py-3 flex items-center justify-center gap-2"
                >
                  Continue to AI Assistant
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === 'chat') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                onClick={() => setView('form')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Activity className="text-amazon-600" size={28} />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                AI Prescription Assistant
              </h1>
            </div>

            <div className="bg-amazon-50 border border-amazon-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Patient:</strong> {patientData?.name} | 
                <strong>Symptoms:</strong> {patientData?.symptoms.join(', ')} | 
                {patientData?.temperature && <> <strong>Temp:</strong> {patientData.temperature}°F</>}
                {patientData?.duration && <> | <strong>Duration:</strong> {patientData.duration} days</>}
                {patientData?.bloodPressure && <> | <strong>BP:</strong> {patientData.bloodPressure}</>}
                {patientData?.heartRate && <> | <strong>HR:</strong> {patientData.heartRate} bpm</>}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-amazon-600 text-white'
                          : 'bg-white text-gray-800 shadow-md border border-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm md:text-base">
                        <div dangerouslySetInnerHTML={{ __html: highlightImportantText(msg.content) }} />
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          msg.role === 'user' ? 'text-amazon-100' : 'text-gray-500'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-amazon-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-amazon-600 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-amazon-600 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about symptoms, treatments, or prescriptions..."
                  disabled={loading}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-500 disabled:bg-gray-100"
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-amazon-600 hover:bg-amazon-700 flex items-center gap-2"
                >
                  <Send size={20} />
                  Send
                </Button>
                <Button
                  onClick={generateReport}
                  disabled={loading || messages.length < 2}
                  variant="outline"
                  className="border-amazon-600 text-amazon-600 hover:bg-amazon-50 flex items-center gap-2"
                >
                  <FileText size={20} />
                  End Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === 'report') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                onClick={() => setView('chat')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Button>
              <FileText className="text-amazon-600" size={28} />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Medical Consultation Report
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Consultation Summary</h2>
                <Button
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob([consultationReport], { type: 'text/plain' });
                    element.href = URL.createObjectURL(file);
                    element.download = `${patientData?.name?.replace(/\s+/g, '_')}_consultation_report.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="bg-amazon-600 hover:bg-amazon-700 flex items-center gap-2"
                >
                  <Download size={20} />
                  Download Report
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border">
                <div 
                  className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightImportantText(consultationReport) }}
                />
              </div>
              
              <div className="mt-6 flex gap-4">
                <Button
                  onClick={() => {
                    setView('menu');
                    setPatientData(null);
                    setMessages([]);
                    setConsultationReport('');
                    setName('');
                    setSymptoms([]);
                    setTemperature('');
                    setDuration('');
                    setAge('');
                    setGender('');
                    setBloodPressure('');
                    setHeartRate('');
                  }}
                  className="bg-amazon-600 hover:bg-amazon-700"
                >
                  New Consultation
                </Button>
                <Link href="/">
                  <Button variant="outline" className="border-amazon-600 text-amazon-600 hover:bg-amazon-50">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
