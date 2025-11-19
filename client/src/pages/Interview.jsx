import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import { sendMessage, getInterview } from '../services/api';
import useSpeech from '../hooks/useSpeech';

const Interview = () => {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const {
        isListening,
        transcript,
        isSpeaking,
        startListening,
        stopListening,
        speak,
        cancelSpeech,
        setTranscript
    } = useSpeech();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const data = await getInterview(id);
                setMessages(data.messages);
            } catch (error) {
                console.error('Failed to load interview', error);
            }
        };
        fetchInterview();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update input when transcript changes
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Stop listening if active
        if (isListening) stopListening();
        // Cancel any current speech
        cancelSpeech();

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setTranscript(''); // Clear transcript
        setLoading(true);

        try {
            const response = await sendMessage(id, input);
            setMessages(prev => [...prev, response.message]);

            // Speak the AI response
            speak(response.message.content);
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">AI Technical Interview</h1>
                {isSpeaking && (
                    <button
                        onClick={cancelSpeech}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        Stop Speaking
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-200 rounded-lg p-4 rounded-bl-none">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="bg-white border-t p-4">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-4 items-center">
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-3 rounded-full transition-colors ${isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        title={isListening ? "Stop Listening" : "Start Listening"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type your answer..."}
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Interview;
