import { useState } from 'react';
import EnhancedChat from '../chat/EnhancedChat';
import { FiMessageCircle } from 'react-icons/fi';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Chatbot
          </h1>
          <p className="text-gray-600">
            Ask questions about products, get recommendations, and place orders through natural conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="h-[600px]">
              <EnhancedChat 
                selectedDocuments={[]}
                className="h-full"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat Features Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-3">
                <FiMessageCircle className="inline w-5 h-5 mr-2" />
                Chat Features
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-blue-900">Natural Language</div>
                    <div className="text-blue-700">Ask questions in plain English</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-blue-900">Product Search</div>
                    <div className="text-blue-700">Find products by text or image</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-blue-900">Smart Orders</div>
                    <div className="text-blue-700">Place orders through conversation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Questions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Try asking:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• "Show me laptops under $1000"</li>
                <li>• "I need a red backpack"</li>
                <li>• "What's available in electronics?"</li>
                <li>• "Help me find running shoes"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
