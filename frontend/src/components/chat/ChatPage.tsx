import EnhancedChat from '../chat/EnhancedChat';
import { FiMessageCircle } from 'react-icons/fi';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="h-[600px]">
              <EnhancedChat 
                selectedDocuments={[]}
                className="h-full"
              />
            </div>
          </div>

          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}
