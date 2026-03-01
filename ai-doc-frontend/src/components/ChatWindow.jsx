import { useState, useRef, useEffect } from "react";
import { searchDocuments } from "../services/api";
import StructuredAnswer from "./StructuredAnswer";

const ChatWindow = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

  const bottomRef = useRef(null);
  const speechRef = useRef(null);
  const recognitionRef = useRef(null);

  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  // -------------------------------
  // TEXT SEARCH
  // -------------------------------
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const currentQuery = query;
    setQuery("");

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: currentQuery,
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    try {
      await searchDocuments(currentQuery, selectedModel, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + chunk }
              : msg,
          ),
        );
      });
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  // -------------------------------
  // VOICE SEARCH
  // -------------------------------
  const handleSearchWithVoice = async (voiceText) => {
    if (!voiceText.trim()) return;

    setLoading(true);
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: voiceText,
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    let fullResponse = "";

    try {
      await searchDocuments(voiceText, selectedModel, (chunk) => {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + chunk }
              : msg,
          ),
        );
      });
      speakAnswer(fullResponse);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setQuery("");
  };

  // -------------------------------
  // SPEECH RECOGNITION
  // -------------------------------
  const startListening = () => {
    if (speaking) stopSpeaking();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearchWithVoice(transcript);
    };
    recognition.onerror = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  // -------------------------------
  // SPEECH SYNTHESIS
  // -------------------------------
  const speakAnswer = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.onstart = () => setSpeaking(true);
    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);
    speechRef.current = speech;
    window.speechSynthesis.speak(speech);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // -------------------------------
  // AUTO SCROLL
  // -------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="flex flex-col h-screen">
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4 select-none">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              What would you like to know?
            </h2>
            <p className="text-gray-500 text-sm max-w-sm">
              Upload a document from the sidebar, then ask questions to get
              AI-powered answers.
            </p>
          </div>
          {/* Suggested prompts */}
          <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
            {[
              "Summarize this document",
              "What are the key points?",
              "Explain the main findings",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setQuery(prompt)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-pink-500 hover:text-pink-400 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto py-6 px-4 md:px-0 space-y-6">
          {messages.map((msg) =>
            msg.role === "user" ? (
              /* User bubble — right aligned */
              <div key={msg.id} className="flex justify-center">
                <div className="w-full max-w-3xl px-4 md:px-6 flex justify-end">
                  <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ) : (
              /* Assistant bubble — left aligned, full width like GPT */
              <div key={msg.id} className="flex justify-center">
                <div className="w-full max-w-3xl px-4 md:px-6 flex gap-3">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="flex-1 text-gray-200 text-sm leading-relaxed pt-0.5">
                    <StructuredAnswer answer={msg.content} />
                  </div>
                </div>
              </div>
            ),
          )}

          {/* Loading dots */}
          {loading && (
            <div className="flex justify-center">
              <div className="w-full max-w-3xl px-4 md:px-6 flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 pt-2">
                  <span
                    className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 md:px-0 py-4 flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Model selector */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <label className="text-xs text-gray-500">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-300
                         focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4.1">GPT-4.1</option>
              <option value="gpt-3.5-turbo">GPT-3.5</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
            </select>
          </div>

          {/* Input box */}
          <div className="flex items-end gap-2 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-pink-500 transition shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Ask something about your documents..."
              className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm focus:outline-none resize-none"
            />

            {/* Mic button */}
            <button
              onClick={startListening}
              title="Voice input"
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition flex-shrink-0 text-sm
                ${listening ? "bg-red-600 text-white" : "text-gray-500 hover:text-pink-400 hover:bg-gray-800"}`}
            >
              🎤
            </button>

            {/* Stop speech */}
            {speaking && (
              <button
                onClick={stopSpeaking}
                className="text-xs px-2 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex-shrink-0"
              >
                ⏹
              </button>
            )}

            {/* Send button */}
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-pink-600 hover:bg-pink-500
                         text-white transition flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <p className="text-center text-xs text-gray-700 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
