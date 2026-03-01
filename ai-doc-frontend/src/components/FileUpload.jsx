import { useState, useRef } from "react";
import { uploadFiles } from "../services/api";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setStatus("");

    try {
      const result = await uploadFiles(files);
      setStatus(
        `✅ ${result.totalFiles} file(s) uploaded | ${result.totalChunks} chunks`,
      );
      setFiles([]);
    } catch (error) {
      setStatus("❌ Upload failed");
    }

    setLoading(false);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => {
      const existingNames = prevFiles.map((f) => f.name);
      return [
        ...prevFiles,
        ...newFiles.filter((f) => !existingNames.includes(f.name)),
      ];
    });
    e.target.value = null;
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section label */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">
        Documents
      </p>

      {/* Hidden input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drop zone */}
      <button
        onClick={() => fileInputRef.current.click()}
        className="w-full border border-dashed border-gray-700 hover:border-pink-500
                   bg-gray-800/40 hover:bg-gray-800 transition rounded-xl p-4
                   flex flex-col items-center gap-2 group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-pink-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <span className="text-xs font-medium text-gray-400 group-hover:text-pink-400 transition">
          Click to upload files
        </span>
        <span className="text-xs text-gray-600">PDF, DOCX, TXT</span>
      </button>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-pink-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-xs text-gray-300 truncate flex-1">
                {file.name}
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-600 hover:text-red-400 transition text-sm leading-none flex-shrink-0 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0}
        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-medium py-2 rounded-xl
                   transition text-sm disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin w-3.5 h-3.5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Uploading...
          </span>
        ) : (
          "Upload"
        )}
      </button>

      {/* Status */}
      {status && (
        <div
          className={`text-xs px-3 py-2 rounded-lg font-medium ${
            status.startsWith("✅")
              ? "bg-green-900/40 text-green-400 border border-green-800"
              : "bg-red-900/40 text-red-400 border border-red-800"
          }`}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
