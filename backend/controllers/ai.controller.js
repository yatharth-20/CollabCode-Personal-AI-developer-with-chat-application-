import * as ai from '../services/ai.service.js';

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        const result = await ai.generateResult(prompt);
        res.send({ result });
    } catch (error) {
        console.error('Error generating result:', error);
        res.status(500).json({ message : error.message});
    }
}   