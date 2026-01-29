import React, { useState } from 'react';
import { AlertCircle, Send, Activity, ArrowLeft } from 'lucide-react';

// Type definitions
interface PatientData {
  symptoms: string[];
  temperature: string;
  duration: string;
  age: string;
  gender: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIResponse {
  commonConditions?: string[];
  suggestedMedicines?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  homeCare?: string[];
  warningSigns?: string[];
  message?: string;
}

// Page 1: Prescriptions Page
const Prescriptions: React.FC<{ onContinue: (data: PatientData) => void }> = ({ onContinue }) => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [temperature, setTemperature] = useState('');
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  const symptomsList = [
    'Fever',
    'Cough',
    'Cold',
    'Headache',
    'Body pain',
    'Sore throat',
    'Vomiting',
    'Diarrhea',
    'Fatigue',
    'Breathing difficulty',
    'Nausea',
    'Dizziness'
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (symptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }
    if (!age || !gender) {
      setError('Please fill in all required fields');
      return;
    }

    // Pass data to next page
    onContinue({
      symptoms,
      temperature,
      duration,
      age,
      gender
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-indigo-600" size={32} />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Patient Symptoms & Prescription
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Select Symptoms <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {symptomsList.map(symptom => (
                  <label
                    key={symptom}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Patient Details */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              Continue to AI Assistant
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Page 2: AI Assistant Chat Page
const AiAssistant: React.FC<{ patientData: PatientData; onBack: () => void }> = ({ patientData, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize conversation with AI
  React.useEffect(() => {
    if (!initialized) {
      initializeChat();
      setInitialized(true);
    }
  }, [initialized]);

  const initializeChat = async () => {
    const initialMessage: Message = {
      role: 'assistant',
      content: `Hello, I'm here to assist you with patient care guidance. Based on the symptoms you've reported (${patientData.symptoms.join(', ')}), I'd like to gather more information to provide better support.\n\nCould you please describe:\n1. The severity of these symptoms (mild, moderate, severe)?\n2. When did the symptoms start?\n3. Are there any other symptoms not listed?`,
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
      // Call backend API endpoint
      // NOTE: Replace with your actual backend endpoint
      const response = await fetch('/ai/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientData,
          messages: [...messages, userMessage],
          query: input
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data: AIResponse = await response.json();

      // Format AI response
      let formattedResponse = '';
      
      if (data.message) {
        formattedResponse = data.message;
      } else {
        if (data.commonConditions && data.commonConditions.length > 0) {
          formattedResponse += '**Possible Common Conditions (for reference only):**\n';
          data.commonConditions.forEach(condition => {
            formattedResponse += `• ${condition}\n`;
          });
          formattedResponse += '\n';
        }

        if (data.suggestedMedicines && data.suggestedMedicines.length > 0) {
          formattedResponse += '**Suggested Over-the-Counter Medicines:**\n';
          data.suggestedMedicines.forEach(med => {
            formattedResponse += `• ${med.name}: ${med.dosage}, ${med.frequency}\n`;
          });
          formattedResponse += '\n';
        }

        if (data.homeCare && data.homeCare.length > 0) {
          formattedResponse += '**Home Care Advice:**\n';
          data.homeCare.forEach(advice => {
            formattedResponse += `• ${advice}\n`;
          });
          formattedResponse += '\n';
        }

        if (data.warningSigns && data.warningSigns.length > 0) {
          formattedResponse += '**⚠️ Warning Signs - Consult Doctor Immediately If:**\n';
          data.warningSigns.forEach(sign => {
            formattedResponse += `• ${sign}\n`;
          });
          formattedResponse += '\n';
        }

        formattedResponse += '**DISCLAIMER:** This is supportive guidance only and not a medical diagnosis. Please consult a qualified doctor for proper medical evaluation and treatment.';
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: formattedResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Handle error - show mock response for demo
      const errorMessage: Message = {
        role: 'assistant',
        content: `I apologize, but I'm having trouble connecting to the medical assistant service. Here's some general guidance based on the symptoms:\n\n**For the reported symptoms (${patientData.symptoms.join(', ')}):**\n\n**Suggested Over-the-Counter Medicines:**\n• Paracetamol: 500mg, every 6-8 hours for fever/pain\n• Oral Rehydration Solution: As needed for hydration\n\n**Home Care Advice:**\n• Rest and stay hydrated\n• Monitor temperature regularly\n• Maintain proper hygiene\n• Eat light, nutritious meals\n\n**⚠️ Seek Doctor Immediately If:**\n• High fever (>103°F) persisting >3 days\n• Difficulty breathing or chest pain\n• Severe dehydration\n• Symptoms worsen rapidly\n• Patient is elderly, infant, or has chronic conditions\n\n**DISCLAIMER:** This is supportive guidance only and not a medical diagnosis. Please consult a qualified doctor for proper medical evaluation and treatment.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <Activity className="text-indigo-600" size={28} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            AI Health Assistant
          </h1>
        </div>
      </div>

      {/* Patient Info Summary */}
      <div className="bg-indigo-50 border-b border-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-700">
            <strong>Patient:</strong> {patientData.age}y, {patientData.gender} | 
            <strong> Symptoms:</strong> {patientData.symptoms.join(', ')} |
            {patientData.temperature && <> <strong>Temp:</strong> {patientData.temperature}°F</>}
            {patientData.duration && <> | <strong>Duration:</strong> {patientData.duration} days</>}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-800 shadow-md border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm md:text-base">
                  {msg.content}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
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
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={20} />
            <span className="hidden md:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'prescriptions' | 'assistant'>('prescriptions');
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  const handleContinue = (data: PatientData) => {
    setPatientData(data);
    setCurrentPage('assistant');
  };

  const handleBack = () => {
    setCurrentPage('prescriptions');
  };

  return (
    <>
      {currentPage === 'prescriptions' && (
        <Prescriptions onContinue={handleContinue} />
      )}
      {currentPage === 'assistant' && patientData && (
        <AiAssistant patientData={patientData} onBack={handleBack} />
      )}
    </>
  );
};

export default App;