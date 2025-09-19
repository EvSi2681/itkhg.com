export default async function handler(req, res) {
  // Только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Метод не поддерживается' });
  }

  // Проверяем ключ
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    console.error('❌ QWEN_API_KEY не найден');
    return res.status(500).json({ 
      answer: 'Ошибка: API ключ не загружен.' 
    });
  }

  // Логируем начало запроса
  console.log('✅ Запрос получен, ключ есть');

  try {
    const { question } = req.body;

    // Простой ответ без API (для теста)
    return res.status(200).json({
      answer: `Вы спросили: "${question}". Сервер работает! Ключ: ${apiKey ? 'найден' : 'не найден'}`
    });

  } catch (error) {
    console.error('🔴 Ошибка:', error);
    return res.status(500).json({ 
      answer: 'Внутренняя ошибка' 
    });
  }
}

// Обязательно!
export const config = {
  runtime: 'edge',
};
