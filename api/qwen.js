// /pages/api/qwen.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    const { prompt } = req.body;

    try {
        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen-max',
                input: {
                    messages: [
                        {
                            role: 'system',
                            content: `
                                Вы — ИИ-помощник компании itkhg.com.
                                Отвечайте вежливо, кратко и по делу.
                                Язык ответа: русский.
                                Тематика: технологии, веб-разработка, облачные решения.
                                Если вопрос вне темы — скажите: "Я могу помочь с вопросами по IT-услугам и технологиям."
                            `
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                }
            })
        });

        const data = await response.json();
        const reply = data.output?.choices?.[0]?.message?.content || 'Не могу ответить.';

        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}
