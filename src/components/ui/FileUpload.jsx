import { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const FileUpload = ({
  onFileSelect,
  accept = "*",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  label,
  error,
  helperText,
  className,
  dragAndDrop = true,
  showFileList = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter((file) => {
      if (maxSize && file.size > maxSize) {
        return false;
      }
      return true;
    });

    setFiles(multiple ? [...files, ...validFiles] : validFiles);

    if (onFileSelect) {
      onFileSelect(multiple ? [...files, ...validFiles] : validFiles[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFileSelect(selectedFiles);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    if (onFileSelect) {
      onFileSelect(multiple ? newFiles : null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragOver ? "border-primary-500 bg-primary-50" : "border-gray-300",
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-50"
            : "hover:border-primary-400 hover:bg-gray-50",
          error && "border-red-500",
          className
        )}
        onDrop={dragAndDrop ? handleDrop : undefined}
        onDragOver={dragAndDrop ? handleDragOver : undefined}
        onDragLeave={dragAndDrop ? handleDragLeave : undefined}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            {dragAndDrop ? (
              <>
                <span className="font-medium text-primary-600 hover:text-primary-500">
                  Kliknij aby wybrać pliki
                </span>
                {" lub przeciągnij je tutaj"}
              </>
            ) : (
              <span className="font-medium text-primary-600 hover:text-primary-500">
                Kliknij aby wybrać pliki
              </span>
            )}
          </div>
          {maxSize && (
            <p className="text-xs text-gray-500">
              Maksymalny rozmiar: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Wybrane pliki:</h4>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <DocumentIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
