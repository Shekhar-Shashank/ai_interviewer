import axios from 'axios';
console.log("vite url", import.meta.env.VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const startInterview = async (topic, difficulty) => {
    try {
        const response = await axios.post(`${API_URL}/interviews/start`, { topic, difficulty });
        return response.data;
    } catch (error) {
        console.error('Error starting interview:', error);
        throw error;
    }
};

export const sendMessage = async (interviewId, message) => {
    try {
        const response = await axios.post(`${API_URL}/interviews/${interviewId}/chat`, { message });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const getInterview = async (interviewId) => {
    try {
        const response = await axios.get(`${API_URL}/interviews/${interviewId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching interview:', error);
        throw error;
    }
};
