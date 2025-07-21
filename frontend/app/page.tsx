'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Zap, 
  Download, 
  Settings, 
  Search,
  User,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Activity,
  Image,
  BarChart3,
  Plus,
  X
} from 'lucide-react';

export default function SuperResolutionDashboard() {
  const [activeTab, setActiveTab] = useState('single');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [targetSize, setTargetSize] = useState('64,64');
  const [scaleFactor, setScaleFactor] = useState(3);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      setEnhancedImageUrl(null);
    }
  };

  const handleSingleImageEnhancement = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      formData.append('target_size', targetSize);
      formData.append('scale_factor', scaleFactor.toString());
      
      const response = await fetch('http://localhost:8002/super_resolve_single', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setEnhancedImageUrl(url);
      } else {
        throw new Error('Enhancement failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMultiImageEnhancement = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 images for multi-frame enhancement.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('target_size', targetSize);
      formData.append('scale_factor', scaleFactor.toString());
      
      const response = await fetch('http://localhost:8002/super_resolve', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setEnhancedImageUrl(url);
      } else {
        throw new Error('Enhancement failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8002/health');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
    }
  };

  const downloadEnhancedImage = () => {
    if (enhancedImageUrl) {
      const a = document.createElement('a');
      a.href = enhancedImageUrl;
      a.download = 'enhanced_image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setEnhancedImageUrl(null);
    // Revoke object URLs to free memory
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    if (enhancedImageUrl) URL.revokeObjectURL(enhancedImageUrl);
  };

  // Fetch health status on component mount
  useState(() => {
    fetchHealthStatus();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Super Resolution</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                System Status
              </h3>
              
              {healthStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Model Loaded</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      healthStatus.model_loaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {healthStatus.model_loaded ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">GPU Available</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      healthStatus.gpu_available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {healthStatus.gpu_available ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Device</span>
                    <span className="font-medium text-xs">{healthStatus.device}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Loading status...</p>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Size (width,height)
                  </label>
                  <input
                    type="text"
                    value={targetSize}
                    onChange={(e) => setTargetSize(e.target.value)}
                    className="input-field text-sm"
                    placeholder="64,64"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale Factor
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(parseInt(e.target.value))}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-6">
              {[
                { id: 'single', label: 'Single Image', icon: Image },
                { id: 'multi', label: 'Multi-Image', icon: Plus }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {activeTab === 'single' ? 'Single Image Enhancement' : 'Multi-Image Enhancement'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    {previewUrls.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                              {activeTab === 'multi' && (
                                <button
                                  onClick={() => {
                                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                                    const newUrls = previewUrls.filter((_, i) => i !== index);
                                    setSelectedFiles(newFiles);
                                    setPreviewUrls(newUrls);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={clearFiles}
                          className="btn-secondary"
                        >
                          Remove Files
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Upload {activeTab === 'single' ? 'image' : 'images'}
                          </p>
                          <p className="text-gray-500">
                            {activeTab === 'single' 
                              ? 'PNG, JPG, or any image format' 
                              : 'Select multiple images (at least 2)'
                            }
                          </p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-primary"
                        >
                          Choose File{activeTab === 'multi' ? 's' : ''}
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple={activeTab === 'multi'}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={activeTab === 'single' ? handleSingleImageEnhancement : handleMultiImageEnhancement}
                        disabled={isProcessing || (activeTab === 'multi' && selectedFiles.length < 2)}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : `Enhance ${activeTab === 'single' ? 'Image' : 'Images'}`}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Result</h3>
                  
                  {isProcessing ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Enhancing image...</p>
                    </div>
                  ) : enhancedImageUrl ? (
                    <div className="space-y-4">
                      <img src={enhancedImageUrl} alt="Enhanced" className="w-full rounded-lg shadow-md" />
                      <button
                        onClick={downloadEnhancedImage}
                        className="w-full btn-secondary flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Enhanced Image</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Upload {activeTab === 'single' ? 'an image' : 'images'} to see enhanced result</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 