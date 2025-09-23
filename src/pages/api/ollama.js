export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    // Получаем данные из запроса
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Требуется параметр prompt' });
    }

    // URL вашего Ollama сервера
    const OLLAMA_URL = 'http://87.121.38.23:11434/api/generate';

    // Создаем потоковый запрос к Ollama
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3:4b',
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.7,
          num_ctx: 2048
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    // Устанавливаем заголовки для потокового ответа
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
    });

    // Перенаправляем потоковый ответ от Ollama к клиенту
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }
    
    res.end();
    
  } catch (error) {
    console.error('Ошибка при обработке запроса к Ollama:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при обработке запроса', 
      details: error.message 
    });
  }
}
