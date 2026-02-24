'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileIcon, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CaseFile } from '@/lib/types';

interface FileUploadAreaProps {
  onFilesSelected: (files: CaseFile[]) => void;
  existingFiles?: CaseFile[];
  onDeleteFile?: (fileId: string) => void;
  maxSize?: number; // in MB
}

export function FileUploadArea({
  onFilesSelected,
  existingFiles = [],
  onDeleteFile,
  maxSize = 50,
}: FileUploadAreaProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<CaseFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve({
          id: Date.now().toString(),
          fileName: file.name,
          fileType: file.type,
          fileData: base64String,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: CaseFile[] = [];

    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        continue;
      }

      try {
        const caseFile = await convertFileToBase64(file);
        validFiles.push(caseFile);
      } catch (error) {
        alert(`Failed to process file ${file.name}`);
      }
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    handleDrag(e);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
    setIsDragActive(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileIcon className="w-4 h-4" />;
  };

  const downloadFile = (file: CaseFile) => {
    const link = document.createElement('a');
    link.href = file.fileData;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (fileData: string): string => {
    const bytes = (fileData.length * 3) / 4;
    if (bytes < 1024) return bytes.toFixed(0) + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Drag and drop files here</p>
            <p className="text-xs text-muted-foreground">
              or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-medium"
              >
                browse files
              </button>
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Maximum file size: {maxSize}MB. Supported: Images, PDF, Documents
          </p>
        </div>
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files ({existingFiles.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {file.fileType.startsWith('image/') ? (
                    <img
                      src={file.fileData}
                      alt={file.fileName}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 bg-secondary rounded">
                      {getFileIcon(file.fileType)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.fileData)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  {file.fileType.startsWith('image/') && (
                    <a
                      href={file.fileData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title="View full size"
                    >
                      <Image className="w-4 h-4 text-muted-foreground" />
                    </a>
                  )}
                  <button
                    onClick={() => downloadFile(file)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                    title="Download"
                  >
                    <FileIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {onDeleteFile && (
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
