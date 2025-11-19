const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const { generateResponse } = require('../services/aiService');

router.post('/start', async (req, res) => {
    try {
        const { topic, difficulty } = req.body;

        const initialMessage = {
            role: 'assistant',
            content: `Hello! I'm your AI interviewer. We'll be conducting a ${difficulty} level interview on ${topic}. Are you ready to begin?`
        };

        const interview = new Interview({
            topic,
            difficulty,
            messages: [initialMessage]
        });

        await interview.save();
        res.json(interview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/:id/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        // Add user message
        interview.messages.push({ role: 'user', content: message });

        // Generate AI response
        // We pass the previous messages as context
        // Note: In a real production app, we might need to limit context window size
        const aiResponseText = await generateResponse(
            interview.messages,
            message,
            interview.topic,
            interview.difficulty
        );

        // Add AI response
        const aiMessage = { role: 'assistant', content: aiResponseText };
        interview.messages.push(aiMessage);

        await interview.save();
        res.json({ message: aiMessage, interviewId: interview._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get interview history
router.get('/:id', async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }
        res.json(interview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
