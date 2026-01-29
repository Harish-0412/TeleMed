import Header from '@/components/Header';
import EyeAnalysis from '@/components/EyeAnalysis';

export default function EyeAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="pt-24 px-4 pb-12">
        <EyeAnalysis />
      </div>
    </div>
  );
}
