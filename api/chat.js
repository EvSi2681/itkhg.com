export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
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
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
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

    const data = await response.json();
    const answer = data.output?.text || 'Извините, ответ временно недоступен.';
    res.status(200).json({ answer });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ 
      answer: 'Сервер временно недоступен. Попробуйте позже.' 
    });
  }
}
