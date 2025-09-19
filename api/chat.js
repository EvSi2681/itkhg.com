export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  const ragContext = `
    Мы предлагаем широкий ассортимент натуральных продуктов, созданных по традициям китайской культуры здоровья.
    Все товары в наличии прошли проверку на безопасность.
    Важно: Продукция не является лекарственным средством. Перед применением проконсультируйтесь со специалистом.
    Если вы ищете средство, которого нет в каталоге — оставьте запрос. Мы проверим возможность его доставки из Китая.
  `;

  const prompt = `
    Ты — помощник itkhg.com. Говори на русском или английском.
    Используй контекст: ${ragContext}
    Правила: не утверждай, что лечишь; напоминай про консультацию; предложи WhatsApp.
    Вопрос: ${question}
    Ответ:
  `;

  try {
    const apiKey = process.env.QWEN_API_KEY;
    
    if (!apiKey) {
      console.error('QWEN_API_KEY не найден');
      return res.status(500).json({ 
        answer: 'Ошибка: ключ API не загружен.' 
      });
    }

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            { role: 'user', content: prompt }
          ]
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('API Error:', errData);
      return res.status(500).json({ 
        answer: 'Ошибка при обращении к Qwen API.' 
      });
    }

    const data = await response.json();
    const answer = data.output?.text || 'Ответ временно недоступен.';
    res.status(200).json({ answer });
  } catch (error) {
    console.error('Catch Error:', error);
    res.status(500).json({ 
      answer: 'Внутренняя ошибка сервера.' 
    });
  }
}

export const config = {
  runtime: 'edge',
};
