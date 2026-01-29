import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import DailyIframe from "@daily-co/daily-js";

interface ConsultationSession {
  consultationId: string;
  workerId: string;
  doctorId: string | null;
  callUrl: string;
  status: string;
}

interface Props {
  sessionId: string;
}

const Teleconsult = ({ sessionId }: Props) => {
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [callStarted, setCallStarted] = useState(false);

  const callFrameRef = useRef<any>(null);

  // 🔹 Fetch consultation session
  useEffect(() => {
    const fetchSession = async () => {
      const ref = doc(db, "consultation_sessions", sessionId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSession(snap.data() as ConsultationSession);
      }
      setLoading(false);
    };

    fetchSession();
  }, [sessionId]);

  // 🔊 Start Daily audio call
  const startCall = () => {
    if (!session?.callUrl) return;

    callFrameRef.current = DailyIframe.createFrame({
      iframeStyle: {
        width: "100%",
        height: "120px",
        border: "none",
      },
      audioOnly: true,
      showLeaveButton: true,
    });

    callFrameRef.current.join({ url: session.callUrl });
    setCallStarted(true);
  };

  // ❌ End call
  const endCall = () => {
    callFrameRef.current?.leave();
    callFrameRef.current?.destroy();
    setCallStarted(false);
  };

  if (loading) {
    return <p className="p-4">Loading teleconsult session...</p>;
  }

  if (!session) {
    return <p className="p-4 text-red-600">Session not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-2 text-center">
        Teleconsult
      </h1>

      <p className="text-sm text-gray-600 text-center mb-4">
        Consultation ID: {session.consultationId}
      </p>

      {/* Call Controls */}
      <div className="flex justify-center gap-4 mb-4">
        {!callStarted ? (
          <button
            onClick={startCall}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Start Audio Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="bg-red-600 text-white px-6 py-2 rounded"
          >
            End Call
          </button>
        )}
      </div>

      {/* Daily Call Container */}
      <div id="daily-call-container" />

      {/* Status */}
      <p className="text-center text-sm text-gray-500 mt-4">
        {callStarted
          ? "Connected. Doctor can join anytime."
          : "Waiting to start call"}
      </p>
    </div>
  );
};

export default Teleconsult;
