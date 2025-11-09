import { useState } from 'react';
import { UploadPanel } from './components/features/id-scanner/UploadPanel';
import { DataForm } from './components/features/id-scanner/DataForm';
import { toast } from 'sonner';

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

function App() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleUploadComplete = (data: ExtractedData) => {
    setExtractedData(data);
    toast.success('Text extraction completed successfully!');
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleDataSave = (data: ExtractedData) => {
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

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left column - Upload Panel */}
          <div className="flex-1">
            <div className="flex flex-col items-center">
              <UploadPanel
                onUploadComplete={handleUploadComplete}
                onError={handleError}
                isUploading={false}
              />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
