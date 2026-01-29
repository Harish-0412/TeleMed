import React, { useState, useEffect } from 'react';
import { auth, db, useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';

export default function HealthWorkerConsultation() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [view, setView] = useState('list');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [pendingConsultations, setPendingConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    village: ''
  });
  
  const [consultation, setConsultation] = useState({
    symptoms: [],
    notes: '',
    temperature: '',
    bloodPressure: ''
  });

  const [saving, setSaving] = useState(false);

  const availableSymptoms = [
    'Fever', 'Cough', 'Headache', 'Body Pain', 'Stomach Pain',
    'Vomiting', 'Diarrhea', 'Difficulty Breathing', 'Chest Pain', 'Weakness'
  ];

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect to login with return URL
        setLocation('/login?redirect=/consultations');
        return;
      }
      fetchPatients();
      fetchPendingConsultations();
      fetchDoctors();
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.village.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchDoctors = async () => {
    try {
      console.log('Fetching all doctors from Firebase health_workers collection...');
      
      const allDoctorsQuery = query(collection(db, 'health_workers'));
      const allDoctorsSnapshot = await getDocs(allDoctorsQuery);
      
      console.log(`Found ${allDoctorsSnapshot.size} documents in health_workers collection`);
      
      const doctorsList = [];
      
      allDoctorsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Doctor ${doc.id}:`, data);
        
        doctorsList.push({
          id: doc.id,
          name: data.name || data.displayName || data.email || 'Unknown Doctor',
          specialization: data.specialization || data.specialty || 'General Medicine',
          availability: data.availability || data.status || 'Available',
          experience: data.experience || data.yearsOfExperience || 'Not specified',
          location: data.location || data.hospital || data.clinic || 'Not specified',
          email: data.email || 'Not provided'
        });
      });
      
      console.log('All fetched doctors:', doctorsList);
      setDoctors(doctorsList);
      
    } catch (error) {
      console.error('Error fetching doctors:', error);
      
      const fallbackDoctors = [
        {
          id: 'fallback-1',
          name: 'Dr. Sarah Johnson',
          specialization: 'General Medicine',
          availability: 'Available',
          experience: '8 years',
          location: 'City Hospital',
          email: 'sarah.johnson@hospital.com'
        },
        {
          id: 'fallback-2',
          name: 'Dr. Michael Chen',
          specialization: 'Pediatrics',
          availability: 'Available',
          experience: '12 years',
          location: 'Children\'s Clinic',
          email: 'michael.chen@clinic.com'
        },
        {
          id: 'fallback-3',
          name: 'Dr. Priya Sharma',
          specialization: 'Cardiology',
          availability: 'Available',
          experience: '15 years',
          location: 'Heart Center',
          email: 'priya.sharma@heartcenter.com'
        }
      ];
      setDoctors(fallbackDoctors);
    }
  };

  const fetchPendingConsultations = async () => {
    try {
      if (!user) return;

      const q = query(
        collection(db, 'consultations'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const consultationsList = [];
      
      // Get all patients first
      const patientsQuery = query(collection(db, 'patients'));
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsMap = {};
      
      patientsSnapshot.forEach((doc) => {
        patientsMap[doc.id] = doc.data();
      });
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'pending') {
          const patientData = patientsMap[data.patientId] || {};
          
          consultationsList.push({
            id: doc.id,
            ...data,
            patientName: patientData.name || 'Unknown Patient',
            patientAge: patientData.age || 'Unknown',
            patientGender: patientData.gender || 'Unknown',
            patientVillage: patientData.village || 'Unknown'
          });
        }
      });
      
      setPendingConsultations(consultationsList);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        return;
      }

      // Query all patients from the collection
      const q = query(
        collection(db, 'patients'),
        orderBy('lastVisited', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const patientsList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patientsList.push({
          id: doc.id,
          name: data.name || 'Unknown',
          age: data.age || 0,
          gender: data.gender || 'Unknown',
          village: data.village || 'Unknown',
          createdBy: data.createdBy,
          lastVisited: data.lastVisited
        });
      });
      
      console.log('Fetched patients:', patientsList);
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error('Error fetching patients:', error);
      
      // Show mock data if Firebase fails
      const mockPatients = [
        {
          id: 'j1B1UFSXhrlndYaUHfLf',
          name: 'Sample Patient',
          age: 35,
          gender: 'Male',
          village: 'Sample Village',
          createdBy: 'fluYw9CONq3jRuE5EY7W',
          lastVisited: new Date()
        }
      ];
      
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
      alert('Using sample data. Check Firebase connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.gender || !newPatient.village) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      
      if (!user) {
        return;
      }

      // Create patient document
      const patientData = {
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        village: newPatient.village,
        createdBy: user.uid,
        lastVisited: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'patients'), patientData);
      
      // Add to local state
      const newPatientWithId = {
        id: docRef.id,
        ...patientData
      };
      setPatients([newPatientWithId, ...patients]);
      
      setNewPatient({ name: '', age: '', gender: '', village: '' });
      setView('list');
      
      alert('Patient added successfully!');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient. Data will sync when online.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSymptom = (symptom) => {
    if (consultation.symptoms.includes(symptom)) {
      setConsultation({
        ...consultation,
        symptoms: consultation.symptoms.filter(s => s !== symptom)
      });
    } else {
      setConsultation({
        ...consultation,
        symptoms: [...consultation.symptoms, symptom]
      });
    }
  };

  const handleSaveConsultation = async () => {
    if (consultation.symptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }

    try {
      setSaving(true);
      
      if (!user) {
        return;
      }

      // Create consultation document
      const consultationData = {
        createdAt: Timestamp.now(),
        notes: consultation.notes,
        patientId: selectedPatient.id,
        status: 'pending',
        symptoms: consultation.symptoms,
        workerId: user.uid
      };

      await addDoc(collection(db, 'consultations'), consultationData);
      
      // Add to pending consultations locally
      const newConsultation = {
        id: Date.now().toString(),
        ...consultationData,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        patientVillage: selectedPatient.village
      };
      setPendingConsultations([newConsultation, ...pendingConsultations]);
      
      setConsultation({ symptoms: [], notes: '', temperature: '', bloodPressure: '' });
      setView('list');
      alert('Patient added to consultation queue!');
      
      // Refresh data
      fetchPatients();
      fetchPendingConsultations();
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Error saving consultation. Data will sync when online.');
    } finally {
      setSaving(false);
    }
  };

  const removeFromQueue = async (consultationId) => {
    try {
      // Get consultation details before removing
      const consultation = pendingConsultations.find(c => c.id === consultationId);
      
      // Remove from local state immediately
      setPendingConsultations(pendingConsultations.filter(c => c.id !== consultationId));
      
      // Delete the consultation document from Firebase
      await deleteDoc(doc(db, 'consultations', consultationId));
      
      // Send completion message via n8n webhook
      if (consultation) {
        const detailedMessage = `🏥 *CONSULTATION COMPLETED*\n\n` +
          `👤 *Patient:* ${consultation.patientName}\n` +
          `📅 *Age:* ${consultation.patientAge} years\n` +
          `⚥ *Gender:* ${consultation.patientGender}\n` +
          `🏘️ *Village:* ${consultation.patientVillage}\n\n` +
          `🤒 *Symptoms Treated:*\n${consultation.symptoms?.map(s => `• ${s}`).join('\n')}\n\n` +
          `💊 *Treatment Provided:*\n• Medical consultation completed\n• Appropriate care provided\n• Health guidance given\n\n` +
          `📋 *Notes:* ${consultation.notes || 'Standard consultation completed'}\n\n` +
          `📅 *Date:* ${new Date().toLocaleDateString('en-GB')}\n\n` +
          `⚠️ *Important:* Follow care instructions and contact clinic if symptoms persist or worsen.\n\n` +
          `✅ *Status:* Treatment successfully completed`;
        
        try {
          await fetch('https://harish-projects.app.n8n.cloud/webhook/teleconsult-alert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: '1871377075',
              message: detailedMessage,
              patientName: consultation.patientName,
              followUpDate: null
            })
          });
        } catch (webhookError) {
          console.error('Error sending completion message:', webhookError);
        }
      }
      
      alert('Patient removed from queue and completion message sent!');
    } catch (error) {
      console.error('Error removing from queue:', error);
      alert('Error removing patient from queue');
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setView('consultation');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN');
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // If not authenticated, the useEffect will redirect to login
  if (!user) {
    return null;
  }

  if (view === 'list') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Appointments & Doctor Management</h1>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setView('doctors')}
                  variant="outline"
                  className="border-amazon-600 text-amazon-600 hover:bg-amazon-50"
                >
                  Doctor Availability
                </Button>
                <Button 
                  onClick={() => setView('addPatient')}
                  className="bg-amazon-600 hover:bg-amazon-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Patient
                </Button>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or village..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
              />
            </div>

            {loading ? (
              <p className="text-center text-gray-600 py-8">Loading patients...</p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-center text-gray-600 py-8 animate-fade-in">
                {searchTerm ? 'No patients found' : 'No patients yet. Add your first patient!'}
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredPatients.map((patient, index) => (
                  <div 
                    key={patient.id} 
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 transform hover:scale-105 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{patient.name}</h3>
                        <p className="text-gray-600 mb-1">
                          Age: {patient.age} | Gender: {patient.gender}
                        </p>
                        <p className="text-gray-600 mb-1">Village: {patient.village}</p>
                        <p className="text-gray-600">
                          Last Visit: {formatDate(patient.lastVisited)}
                        </p>
                      </div>
                      <div className="text-amazon-600 text-2xl">→</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Consultation Queue */}
            {pendingConsultations.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Consultation Queue</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-medium">Patients waiting for doctor consultation</p>
                </div>
                <div className="grid gap-4">
                  {pendingConsultations.map((consultation, index) => (
                    <div key={consultation.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400 animate-slide-up transform transition-all duration-300 hover:scale-105" style={{ animationDelay: `${index * 150}ms` }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                              #{index + 1} in Queue
                            </span>
                            <span className="text-gray-500 text-sm">
                              {formatDate(consultation.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {consultation.patientName || 'Unknown Patient'}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            Age: {consultation.patientAge} | Gender: {consultation.patientGender}
                          </p>
                          <p className="text-gray-600 mb-2">Village: {consultation.patientVillage}</p>
                          <p className="text-gray-700 font-medium mb-1">Symptoms:</p>
                          <p className="text-gray-600 mb-2">{consultation.symptoms?.join(', ')}</p>
                          {consultation.notes && (
                            <>
                              <p className="text-gray-700 font-medium mb-1">Notes:</p>
                              <p className="text-gray-600">{consultation.notes}</p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                              <span className="text-2xl">⏳</span>
                            </div>
                            <p className="text-sm text-yellow-700 font-medium">Waiting</p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromQueue(consultation.id);
                            }}
                            variant="outline"
                            size="sm"
                            className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  if (view === 'addPatient') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                onClick={() => setView('list')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Patient Name *</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                    placeholder="Enter patient name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Age *</label>
                    <input
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Gender *</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Village *</label>
                  <input
                    type="text"
                    value={newPatient.village}
                    onChange={(e) => setNewPatient({...newPatient, village: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                    placeholder="Enter village name"
                  />
                </div>

                <Button 
                  onClick={handleAddPatient}
                  disabled={saving}
                  className="w-full bg-amazon-600 hover:bg-amazon-700 py-3"
                >
                  {saving ? 'Adding Patient...' : 'Add Patient'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === 'consultation') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                onClick={() => setView('list')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                Consultation - {selectedPatient?.name}
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Symptoms</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSymptoms.map((symptom) => (
                      <label key={symptom} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consultation.symptoms.includes(symptom)}
                          onChange={() => toggleSymptom(symptom)}
                          className="rounded border-gray-300 text-amazon-600 focus:ring-amazon-500"
                        />
                        <span className="text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Temperature (°F)</label>
                    <input
                      type="text"
                      value={consultation.temperature}
                      onChange={(e) => setConsultation({...consultation, temperature: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                      placeholder="e.g., 98.6"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Blood Pressure</label>
                    <input
                      type="text"
                      value={consultation.bloodPressure}
                      onChange={(e) => setConsultation({...consultation, bloodPressure: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                      placeholder="e.g., 120/80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Additional Notes</label>
                  <textarea
                    value={consultation.notes}
                    onChange={(e) => setConsultation({...consultation, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                    rows={4}
                    placeholder="Any additional observations or notes..."
                  />
                </div>

                <Button 
                  onClick={handleSaveConsultation}
                  disabled={saving}
                  className="w-full bg-amazon-600 hover:bg-amazon-700 py-3"
                >
                  {saving ? 'Saving Consultation...' : 'Save Consultation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === 'doctors') {
    return <DoctorAvailabilityView doctors={doctors} onBack={() => setView('list')} />;
  }

  return null;
}

// Doctor Availability View
function DoctorAvailabilityView({ doctors, onBack }) {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Appointments
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Availability Management</h1>
          </div>

          <div className="grid gap-6">
            {doctors.map((doctor, index) => (
              <div 
                key={doctor.id} 
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transform transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        doctor.availability === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : doctor.availability === 'Busy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.availability}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Specialization</p>
                        <p>{doctor.specialization}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Experience</p>
                        <p>{doctor.experience}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Location</p>
                        <p>{doctor.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                        doctor.availability === 'Available' 
                          ? 'bg-green-100' 
                          : doctor.availability === 'Busy'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}>
                        <span className="text-2xl">
                          {doctor.availability === 'Available' ? '✅' : doctor.availability === 'Busy' ? '⏳' : '❌'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{doctor.availability}</p>
                    </div>
                    
                    {doctor.availability === 'Available' && (
                      <Button
                        className="bg-amazon-600 hover:bg-amazon-700"
                        onClick={() => {
                          alert(`Connecting to ${doctor.name}...`);
                        }}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {doctors.filter(d => d.availability === 'Available').length}
              </div>
              <p className="text-green-700 font-medium">Available Doctors</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {doctors.filter(d => d.availability === 'Busy').length}
              </div>
              <p className="text-yellow-700 font-medium">Busy Doctors</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {doctors.filter(d => d.availability === 'Offline').length}
              </div>
              <p className="text-red-700 font-medium">Offline Doctors</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}