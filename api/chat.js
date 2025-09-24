export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  // Получаем сообщение из тела запроса
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Нет сообщения' });
  }

  try {
    // Отправляем запрос на ваш локальный API
    const response = await fetch('http://87.121.38.23:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Ошибка от локального API');
    }

    const data = await response.json();

    // Возвращаем ответ клиенту
    res.status(200).json(data);
  } catch (error) {
    console.error('Ошибка прокси:', error);
    res.status(500).json({ error: 'Не удалось получить ответ от ИИ' });
  }
}

export const config = {
  runtime: 'edge',
};
