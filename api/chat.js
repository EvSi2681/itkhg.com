import { Generation } from 'dashscope';

export default async function handler(req, res) {
    const { prompt } = req.body;
    
    const dashscope = new Generation({ apiKey: process.env.DASHSCOPE_API_KEY });

    const response = await dashscope.call({
        model: 'qwen-max',
        input: { messages: [{ role: 'user', content: prompt }] }
    });

    const reply = response.output.choices[0]?.message?.content || 'Ошибка';
    res.status(200).json({ reply });
}
