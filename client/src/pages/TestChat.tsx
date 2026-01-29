import React from 'react';
import Header from '../components/Header';

const TestChat = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Chat</h1>
            <p className="text-gray-600 mb-6">
              This is a test page for chat functionality.
            </p>
            <p className="text-gray-500">
              Use the teleconsult page for actual video/audio calls.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestChat;