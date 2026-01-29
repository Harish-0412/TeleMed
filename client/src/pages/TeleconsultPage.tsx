import { useEffect, useState, useRef } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  getDocs 
} from "firebase/firestore";
import { auth, db } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '../components/Header';

const PIPECAT_API_KEY = "db8f1d46385f7bbc499c1d6e895824643edd5e4a430e667f79e8f22ef6c7ac7a";

interface ConsultationSession {
  consultationId: string;
  workerId: string;
  doctorId: string | null;
  callUrl: string;
  status: string;
}

const TeleconsultPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callRoom, setCallRoom] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  const callFrameRef = useRef<any>(null);
  const workerUid = auth.currentUser?.uid;

  useEffect(() => {
    if (!workerUid) return;

    const q = query(
      collection(db, 'consultations'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const consultationsList = [];
      
      const patientsQuery = query(collection(db, 'patients'));
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsMap = {};
      
      patientsSnapshot.forEach((doc) => {
        patientsMap[doc.id] = doc.data();
      });
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const patientData = patientsMap[data.patientId] || {};
        
        consultationsList.push({
          id: doc.id,
          ...data,
          patientName: patientData.name || 'Unknown Patient',
          patientAge: patientData.age || 'Unknown',
          patientGender: patientData.gender || 'Unknown',
          patientVillage: patientData.village || 'Unknown'
        });
      });
      
      setConsultations(consultationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [workerUid]);

  const createCallRoom = async (consultation) => {
    try {
      // Create working video call room using Daily.co API
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 7c8d4b2a1f3e5c9b8a7d6e4f2c1b9a8e7d6c5b4a3f2e1d9c8b7a6f5e4d3c2b1a0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `consultation-${consultation.id}`,
          privacy: 'public',
          properties: {
            max_participants: 2,
            enable_chat: true,
            enable_screenshare: true
          }
        }),
      });

      if (response.ok) {
        const roomData = await response.json();
        setCallRoom(roomData);
        setSelectedConsultation(consultation);
        
        setSession({
          consultationId: consultation.id,
          workerId: workerUid,
          doctorId: null,
          callUrl: roomData.url,
          status: 'active'
        });
        
        await updateDoc(doc(db, 'consultations', consultation.id), {
          status: 'active',
          callRoomId: roomData.name,
          callUrl: roomData.url
        });
      } else {
        // Fallback to Jitsi Meet if Daily.co fails
        const jitsiRoom = {
          name: `consultation-${consultation.id}`,
          url: `https://meet.jit.si/consultation-${consultation.id}`,
          id: `room_${Date.now()}`
        };
        
        setCallRoom(jitsiRoom);
        setSelectedConsultation(consultation);
        
        setSession({
          consultationId: consultation.id,
          workerId: workerUid,
          doctorId: null,
          callUrl: jitsiRoom.url,
          status: 'active'
        });
        
        await updateDoc(doc(db, 'consultations', consultation.id), {
          status: 'active',
          callRoomId: jitsiRoom.id,
          callUrl: jitsiRoom.url
        });
      }
    } catch (error) {
      console.error('Error creating call room:', error);
      // Always fallback to working Jitsi Meet
      const jitsiRoom = {
        name: `consultation-${consultation.id}`,
        url: `https://meet.jit.si/consultation-${consultation.id}`,
        id: `room_${Date.now()}`
      };
      
      setCallRoom(jitsiRoom);
      setSelectedConsultation(consultation);
      
      setSession({
        consultationId: consultation.id,
        workerId: workerUid,
        doctorId: null,
        callUrl: jitsiRoom.url,
        status: 'active'
      });
      
      await updateDoc(doc(db, 'consultations', consultation.id), {
        status: 'active',
        callRoomId: jitsiRoom.id,
        callUrl: jitsiRoom.url
      });
    }
  };

  const startCall = () => {
    if (!session?.callUrl) return;
    
    if (callInProgress) {
      alert('Call is already running with the doctor!');
      return;
    }

    window.open(session.callUrl, '_blank', 'width=800,height=600');
    setCallStarted(true);
    setCallInProgress(true);
  };

  const sendFollowUpMessage = async (patientName, message, followUpDate = null) => {
    try {
      const webhookData = {
        chatId: '1871377075',
        message: message,
        patientName: patientName,
        followUpDate: followUpDate
      };

      await fetch('https://harish-projects.app.n8n.cloud/webhook/teleconsult-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Error sending follow-up message:', error);
    }
  };

  const endCall = async () => {
    setShowFollowUpModal(true);
  };

  const confirmEndCall = async () => {
    try {
      // Mark consultation as completed and remove from queue
      await updateDoc(doc(db, 'consultations', selectedConsultation.id), {
        status: 'completed',
        completedAt: new Date(),
        followUpDate: followUpDate || null
      });
      
      // Create detailed message with all consultation info
      const detailedMessage = `🏥 *TELECONSULTATION COMPLETED*\n\n` +
        `👤 *Patient:* ${selectedConsultation.patientName}\n` +
        `📅 *Age:* ${selectedConsultation.patientAge} years\n` +
        `⚥ *Gender:* ${selectedConsultation.patientGender}\n` +
        `🏘️ *Village:* ${selectedConsultation.patientVillage}\n\n` +
        `🤒 *Symptoms Treated:*\n${selectedConsultation.symptoms?.map(s => `• ${s}`).join('\n')}\n\n` +
        `💊 *Treatment Provided:*\n• Teleconsultation completed\n• Medical guidance provided\n• Care instructions given\n\n` +
        `📋 *Notes:* ${selectedConsultation.notes || 'Standard consultation completed'}\n\n` +
        `📅 *Follow-up:* ${followUpDate ? `Scheduled for ${new Date(followUpDate).toLocaleDateString('en-GB')}` : 'No follow-up scheduled'}\n\n` +
        `⚠️ *Important:* Contact clinic immediately if symptoms worsen or new symptoms appear.\n\n` +
        `✅ *Status:* Consultation successfully completed`;
      
      await sendFollowUpMessage(selectedConsultation.patientName, detailedMessage, followUpDate);
      
      setCallStarted(false);
      setCallInProgress(false);
      setCallRoom(null);
      setSession(null);
      setSelectedConsultation(null);
      setShowFollowUpModal(false);
      setFollowUpDate('');
      
      alert('Consultation completed and detailed report sent!');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-4xl mx-auto text-center py-20">
            <p className="text-gray-600">Loading consultations...</p>
          </div>
        </div>
      </>
    );
  }

  if (session && callRoom) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
          <div className="max-w-4xl mx-auto py-20">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Teleconsult Session</h1>
              
              <p className="text-gray-600 mb-4">
                Consultation ID: {session.consultationId}
              </p>
              
              <p className="text-gray-600 mb-6">
                Patient: {selectedConsultation?.patientName}
              </p>

              <div className="flex justify-center gap-4 mb-6">
                {!callStarted ? (
                  <Button
                    onClick={startCall}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    Start Call
                  </Button>
                ) : (
                  <Button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                  >
                    End Call
                  </Button>
                )}
              </div>

              {/* Follow-up Modal */}
              {showFollowUpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Schedule Follow-up</h3>
                    <p className="text-gray-600 mb-4">Would you like to schedule a follow-up for {selectedConsultation?.patientName}?</p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-500"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={confirmEndCall}
                        className="flex-1 bg-amazon-600 hover:bg-amazon-700"
                      >
                        Complete Consultation
                      </Button>
                      <Button
                        onClick={() => setShowFollowUpModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Room Details:</h3>
                <p className="text-sm text-gray-600">Room ID: {callRoom.id}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Share the room ID with the doctor to join the call
                </p>
              </div>

              <p className="text-center text-sm text-gray-500">
                {callInProgress
                  ? "Call is running with the doctor. Click 'End Call' when consultation is complete."
                  : callStarted
                  ? "Call started. Doctor can join using the room ID."
                  : "Ready to start call"}
              </p>

              <Button
                onClick={() => {
                  setCallRoom(null);
                  setSession(null);
                  setSelectedConsultation(null);
                }}
                variant="outline"
                className="mt-4"
              >
                Back to Consultations
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Teleconsultation</h1>

          {consultations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📞</div>
              <p className="text-gray-600 text-lg">No consultations available for teleconsult</p>
              <p className="text-gray-500 mt-2">Consultations will appear here when ready</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          consultation.status === 'requested' ? 'bg-orange-100 text-orange-800' :
                          consultation.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {consultation.status?.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatDate(consultation.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {consultation.patientName}
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
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => createCallRoom(consultation)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Create Call Room
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeleconsultPage;