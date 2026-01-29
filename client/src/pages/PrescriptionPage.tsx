import React, { useState } from 'react';
import { auth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, Send, Activity, ArrowLeft, Copy, Printer, Clock, Pill } from 'lucide-react';

interface PatientData {
  name: string;
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

const PrescriptionPage = () => {
  const [view, setView] = useState<'form' | 'chat' | 'summary'>('form');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [prescriptionGenerated, setPrescriptionGenerated] = useState(false);
  const [consultationSummary, setConsultationSummary] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [temperature, setTemperature] = useState('');
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  const symptomsList = [
    'Fever', 'Cough', 'Cold', 'Headache', 'Body pain', 'Sore throat',
    'Vomiting', 'Diarrhea', 'Fatigue', 'Breathing difficulty', 'Nausea', 'Dizziness',
    'Stomach pain', 'Joint pain', 'Skin rash', 'Eye irritation', 'Ear pain', 'Chest pain'
  ];

  const quickActionButtons = [
    { id: 'vitals', label: 'Check Vitals', icon: Activity, message: 'What vital signs should I monitor for this patient?' },
    { id: 'prescription', label: 'Generate Prescription', icon: Pill, message: 'Please provide a detailed prescription with exact dosages and duration for this patient.' },
    { id: 'followUp', label: 'Follow-up Plan', icon: Clock, message: 'When should this patient return for follow-up? What should I monitor?' },
    { id: 'emergency', label: 'Emergency Signs', icon: AlertCircle, message: 'What are the warning signs that would require immediate medical attention?' }
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

    const data = { name: name.trim(), symptoms, temperature, duration, age, gender };
    setPatientData(data);
    setView('chat');
    initializeChat(data);
  };

  const initializeChat = async (data: PatientData) => {
    const initialMessage: Message = {
      role: 'assistant',
      content: `Hello! I'm Dr. Sarah, your AI medical assistant. I'm here to help you provide the best care for your patient.

I see you have a ${data.age}-year-old ${data.gender} patient presenting with ${data.symptoms.join(', ').toLowerCase()}. ${data.temperature ? `Their temperature is ${data.temperature}°F` : ''} ${data.duration ? `and they've had these symptoms for ${data.duration} days` : ''}.

To give you the most helpful guidance, could you tell me:

1. How severe would you say these symptoms are right now?
2. Is the patient able to keep fluids down?
3. Any other concerns you've noticed?

I'm here to support your clinical judgment with evidence-based recommendations. What's your biggest concern about this patient right now?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setInitialized(true);
  };

  const generateConsultationSummary = async () => {
    setLoading(true);
    try {
      const consultationHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      
      const summaryRequest = {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Generate a comprehensive consultation summary based on the conversation. Format it professionally as a medical consultation report.`
          },
          {
            role: 'user',
            content: `Please create a detailed consultation summary for this patient:\n\nPatient Details:\n- Age: ${patientData?.age} years\n- Gender: ${patientData?.gender}\n- Presenting Symptoms: ${patientData?.symptoms.join(', ')}\n- Temperature: ${patientData?.temperature || 'Not recorded'}°F\n- Duration: ${patientData?.duration || 'Not specified'} days\n\nConsultation History:\n${consultationHistory}\n\nPlease provide a structured summary including:\n1. Patient Information\n2. Chief Complaints\n3. Assessment\n4. Prescribed Medications (with exact dosages)\n5. Home Care Instructions\n6. Follow-up Plan\n7. Warning Signs\n8. Next Appointment Recommendations`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(summaryRequest)
      });

      if (response.ok) {
        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content || 'Summary generation failed';
        setConsultationSummary(summary);
        
        // Send follow-up message via n8n webhook
        const detailedMessage = `🏥 *AI CONSULTATION COMPLETED*\n\n` +
          `👤 *Patient:* ${patientData?.name}\n` +
          `📅 *Age:* ${patientData?.age} years\n` +
          `⚥ *Gender:* ${patientData?.gender}\n` +
          `🌡️ *Temperature:* ${patientData?.temperature || 'Not recorded'}°F\n` +
          `⏱️ *Duration:* ${patientData?.duration || 'Not specified'} days\n\n` +
          `🤒 *Symptoms Treated:*\n${patientData?.symptoms.map(s => `• ${s}`).join('\n')}\n\n` +
          `💊 *AI Prescription & Treatment:*\n${summary.split('\n').slice(0, 10).join('\n')}\n\n` +
          `📋 *Complete Report:* Full consultation summary generated\n\n` +
          `📅 *Follow-up:* As recommended in treatment plan\n\n` +
          `⚠️ *Important:* Follow prescribed medications and contact clinic if symptoms worsen.\n\n` +
          `✅ *Status:* AI consultation successfully completed`;
        
        try {
          await fetch('https://harish-projects.app.n8n.cloud/webhook/teleconsult-alert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: '1871377075',
              message: detailedMessage,
              patientName: patientData?.name,
              followUpDate: null,
              consultationSummary: summary
            })
          });
        } catch (webhookError) {
          console.error('Error sending follow-up message:', webhookError);
        }
      } else {
        setConsultationSummary(generateFallbackSummary());
      }
    } catch (error) {
      setConsultationSummary(generateFallbackSummary());
    } finally {
      setLoading(false);
      setView('summary');
    }
  };

  const generateFallbackSummary = () => {
    const prescriptions = messages
      .filter(msg => msg.role === 'assistant' && (msg.content.toLowerCase().includes('medicine') || msg.content.toLowerCase().includes('tablet')))
      .map(msg => msg.content)
      .join('\n\n');

    return `**CONSULTATION SUMMARY**\n\n**Patient Information:**\n- Name: [Patient Name]\n- Age: ${patientData?.age} years\n- Gender: ${patientData?.gender}\n- Date: ${new Date().toLocaleDateString()}\n\n**Chief Complaints:**\n${patientData?.symptoms.join(', ')}\n\n**Vital Signs:**\n- Temperature: ${patientData?.temperature || 'Not recorded'}°F\n- Duration of symptoms: ${patientData?.duration || 'Not specified'} days\n\n**Assessment & Treatment:**\n${prescriptions || 'No specific prescriptions recorded'}\n\n**Follow-up Instructions:**\n- Monitor symptoms closely\n- Return if condition worsens\n- Complete prescribed medication course\n\n**Next Appointment:**\nSchedule follow-up in 3-7 days or as needed\n\n**Emergency Contact:**\nSeek immediate medical attention if symptoms worsen significantly.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || !patientData) return;

    // Check if user wants to end chat
    if (input.toLowerCase().includes('end chat') || input.toLowerCase().includes('end consultation')) {
      generateConsultationSummary();
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('Attempting Groq API call...');
      
      const requestBody = {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are Dr. Sarah, a compassionate and experienced medical assistant helping health workers in rural clinics. You specialize in providing detailed, practical medical guidance with specific prescriptions.

Patient Details:
- Age: ${patientData.age} years old
- Gender: ${patientData.gender}
- Current symptoms: ${patientData.symptoms.join(', ')}
- Temperature: ${patientData.temperature ? patientData.temperature + '°F' : 'Not recorded'}
- Symptom duration: ${patientData.duration ? patientData.duration + ' days' : 'Not specified'}

Provide comprehensive medical guidance including:
1. **Detailed Medicine Prescription**: Specific drug names, exact dosages, frequency, duration (e.g., "Paracetamol 500mg, take 1 tablet every 6 hours for 3-5 days")
2. **Patient Instructions**: How to take medicines (with/without food, timing, what to avoid)
3. **Home Care Plan**: Specific daily care instructions
4. **Follow-up Schedule**: When to return or check progress
5. **Warning Signs**: Exact symptoms that need immediate medical attention

Be conversational, caring, and thorough. Always ask follow-up questions to ensure complete care. Include practical tips for rural settings.`
          },
          {
            role: 'user',
            content: input
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Empty response from API');
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Check if this looks like a prescription response
      if (aiResponse.toLowerCase().includes('prescription') || aiResponse.toLowerCase().includes('medicine') || aiResponse.toLowerCase().includes('tablet')) {
        setPrescriptionGenerated(true);
      }

      // Check if AI is asking to end consultation
      if (aiResponse.toLowerCase().includes('end the chat') || aiResponse.toLowerCase().includes('conclude') || aiResponse.toLowerCase().includes('wrap up')) {
        setTimeout(() => {
          const endMessage: Message = {
            role: 'assistant',
            content: 'If you\'re satisfied with the consultation, you can type "end chat" to generate a complete consultation summary with all prescriptions and recommendations.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, endMessage]);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Groq API Error Details:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `Hi there! I'm having some connection issues right now, but I'm here to help with your patient who has ${patientData.symptoms.join(', ').toLowerCase()}.

Based on these symptoms, here's my immediate advice:

**Right now, try this:**
• Give Paracetamol 500mg every 6 hours for fever
• Lots of fluids - water, ORS, or coconut water
• Cool sponging if fever is high
• Light, easy-to-digest foods

**Watch out for:**
• Fever over 103°F or lasting more than 3 days
• Signs of dehydration (dry mouth, no urination)
• Difficulty breathing
• Severe headache with neck stiffness

**My recommendation:** If any of these warning signs appear, get medical help immediately. Otherwise, continue supportive care and monitor closely.

How long has the patient had these symptoms? Any improvement with current treatment?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (message: string) => {
    setInput(message);
    setTimeout(() => sendMessage(), 100);
  };

  const copyPrescription = () => {
    const prescriptionText = messages
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content)
      .join('\n\n');
    navigator.clipboard.writeText(prescriptionText);
    alert('Prescription copied to clipboard!');
  };

  const printSummary = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Consultation Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Consultation Summary</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <div style="white-space: pre-wrap;">${consultationSummary}</div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (view === 'form') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
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
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter patient's full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="animate-slide-up">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Select Symptoms <span className="text-red-500">*</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {symptomsList.map((symptom, index) => (
                      <label
                        key={symptom}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-amazon-50 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <input
                          type="checkbox"
                          checked={symptoms.includes(symptom)}
                          onChange={() => handleSymptomToggle(symptom)}
                          className="w-5 h-5 text-amazon-600 rounded focus:ring-2 focus:ring-amazon-500 transition-all duration-200"
                        />
                        <span className="text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="transform transition-all duration-200 hover:scale-105">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="e.g., 98.6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="transform transition-all duration-200 hover:scale-105">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration of Symptoms (days)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="transform transition-all duration-200 hover:scale-105">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g., 35"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="transform transition-all duration-200 hover:scale-105">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full bg-amazon-600 hover:bg-amazon-700 py-3 flex items-center justify-center gap-2 transform transition-all duration-200 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: '500ms' }}
                >
                  Continue to AI Assistant
                  <Send size={20} className="animate-pulse" />
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
                <ArrowLeft size={20} />
                Back
              </Button>
              <Activity className="text-amazon-600" size={28} />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                AI Health Assistant
              </h1>
            </div>

            <div className="bg-amazon-50 border border-amazon-200 rounded-lg p-4 mb-6 animate-slide-down">
              <p className="text-sm text-gray-700">
                <strong>Patient:</strong> {patientData?.name} ({patientData?.age}y, {patientData?.gender}) | 
                <strong> Symptoms:</strong> {patientData?.symptoms.join(', ')} |
                {patientData?.temperature && <> <strong>Temp:</strong> {patientData.temperature}°F</>}
                {patientData?.duration && <> | <strong>Duration:</strong> {patientData.duration} days</>}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {quickActionButtons.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.id}
                    onClick={() => handleQuickAction(action.message)}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-3 text-xs transform transition-all duration-200 hover:scale-105 hover:shadow-md animate-slide-up"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                    disabled={loading}
                  >
                    <IconComponent size={16} className="animate-bounce" style={{ animationDelay: `${index * 200}ms` }} />
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* Prescription Actions */}
            {prescriptionGenerated && (
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={copyPrescription}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copy
                </Button>
                <Button
                  onClick={printSummary}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </Button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex-1 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 flex animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-lg p-4 transform transition-all duration-200 hover:scale-105 ${
                        msg.role === 'user'
                          ? 'bg-amazon-600 text-white'
                          : 'bg-white text-gray-800 shadow-md border border-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm md:text-base">
                        {msg.content}
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
                  <div className="flex justify-start animate-pulse">
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
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message or 'end chat' for summary..."
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
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === 'summary') {
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
                <ArrowLeft size={20} />
                New Consultation
              </Button>
              <Activity className="text-amazon-600" size={28} />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Consultation Summary
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Medical Consultation Report</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigator.clipboard.writeText(consultationSummary)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </Button>
                  <Button
                    onClick={printSummary}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Printer size={16} />
                    Print
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 animate-slide-down">
                <p className="text-sm text-gray-700">
                  <strong>Patient:</strong> {patientData?.name} ({patientData?.age}y, {patientData?.gender}) | 
                  <strong> Date:</strong> {new Date().toLocaleDateString()} |
                  <strong> Time:</strong> {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="prose max-w-none animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {consultationSummary}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => {
                  setView('form');
                  setMessages([]);
                  setPatientData(null);
                  setPrescriptionGenerated(false);
                  setConsultationSummary('');
                  setName('');
                  setSymptoms([]);
                  setTemperature('');
                  setDuration('');
                  setAge('');
                  setGender('');
                }}
                className="bg-amazon-600 hover:bg-amazon-700"
              >
                Start New Consultation
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default PrescriptionPage;
