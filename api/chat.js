// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Нет сообщения' });
  }

  // Ваши товары — можно обновлять при добавлении новых
  const availableProducts = `
    - Чай из красной фасоли — для детокса и пищеварения
    - Концентрированный напиток из морского ежа — поддержка иммунитета
    - Напиток из американского женьшеня — энергия и бодрость
    - Гель с азелаиновой кислотой — уход за кожей
    - Капсулы с коэнзимом Q10 — поддержка сердца и энергии
    - Таблетки с гинкго билоба — ясность ума и кровообращение
    - Фильтр для сигарет — забота о лёгких
    - Средство после похмелья — поддержка печени
  `;

  const prompt = `Ты — AI-консультант на сайте ITKN. Отвечай кратко, дружелюбно и честно. Не назначай лечение. 
  Используй фразы: "традиционно используется", "поддерживает", "может помочь при".
  Если спрашивают про болезнь — предложи средство по описанию состояния.
  Если спрашивают про аналог — скажи, что не даёшь медицинских рекомендаций, но можешь предложить натуральное средство.

  Доступные товары:
  ${availableProducts}

  Вопрос: ${message}
  Ответ:`;

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        version: 'f99382d56dc839de092d8a9e5756eb6c534ed801b4daf446121d3f1fc562d519', // qwen3:4b
        input: { prompt }
      })
    });

    if (!response.ok) {
      throw new Error('Ошибка от Replicate');
    }

    const prediction = await response.json();

    // Ждём завершения генерации
    let finalResult;
    while (!finalResult || !finalResult.output) {
      const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      finalResult = await checkResponse.json();
      if (finalResult.status === 'succeeded') break;
      if (finalResult.status === 'failed') throw new Error('Генерация не удалась');
      await new Promise(r => setTimeout(r, 500));
    }

    const reply = finalResult.output.join('').trim() || 'Не удалось получить ответ.';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: 'Не удалось связаться с ИИ' });
  }
}

export const config = { runtime: 'edge' };
