import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { UploadPanel } from './UploadPanel';
import { DataForm } from './DataForm';
import { toast } from 'sonner';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

interface ExtractedData {
  id?: string;
  lastName?: string;
  firstName?: string;
  middleInitial?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  sex?: string;
  dob?: string;
  confidence?: number;
}

const IDScannerPageContent: React.FC = () => {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleUploadComplete = (data: ExtractedData) => {
    setExtractedData(data);
    toast.success('Text extraction completed successfully!');
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleDataSave = (data: ExtractedData) => {
    // Update local state with saved data
    setExtractedData(data);
    toast.success('Data saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ID Photo Scanner
          </h1>
          <p className="text-lg text-gray-600">
            Upload an ID photo to extract information using AI
          </p>
        </div>

        {/* Two-column layout for desktop, stacked for mobile */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left column - Upload Panel */}
          <div className="flex-1">
            <div className="flex flex-col items-center">
              <UploadPanel
                onUploadComplete={handleUploadComplete}
                onError={handleError}
                isUploading={isLoading}
              />

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload a clear photo of an ID document</li>
                  <li>• Supported formats: JPG, PNG, PDF, HEIC</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• AI will extract text automatically</li>
                  <li>• Review and edit extracted information</li>
                  <li>• Save to database when complete</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right column - Data Form */}
          <div className="flex-1">
            <div className="flex flex-col items-center">
              <DataForm
                initialData={extractedData || undefined}
                onDataSave={handleDataSave}
                readonly={!extractedData}
                confidence={extractedData?.confidence}
              />

              {/* Status Information */}
              {extractedData && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg max-w-md">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Extraction Complete
                  </h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>• Text has been extracted from your ID photo</p>
                    <p>• Review the extracted information</p>
                    <p>• Click "Edit" to make corrections if needed</p>
                    <p>• Click "Save" to store in the database</p>
                  </div>

                  {extractedData.confidence && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700">
                        AI Confidence: {Math.round((extractedData.confidence || 0) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by AI • Secure • Private • Fast</p>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export const IDScannerPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <IDScannerPageContent />
    </QueryClientProvider>
  );
};