import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Здравствуйте! Я - ваш фармацевтический консультант. Могу помочь подобрать препараты, рассказать о китайских аналогах и дать рекомендации. Как я могу вам помочь?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Создаем временный assistant message для потоковой передачи
      const assistantMessage = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Формируем промпт с контекстом медицинского консультанта
      const fullPrompt = `Ты - фармацевт и медицинский консультант сайта itkhg.com. Пользователь спрашивает о препаратах и здоровье. 
      Отвечай кратко, профессионально и дружелюбно. Если вопрос касается диагноза или лечения, 
      рекомендуй обратиться к врачу, но можешь предложить подходящие препараты из каталога itkhg.com.
      Если спрашивают о китайских аналогах, укажи соответствующие препараты.
      
      История диалога:
      ${messages.map(m => `${m.role === 'user' ? 'Пользователь' : 'Фармацевт'}: ${m.content}`).join('\n')}
      
      Пользователь: ${input}
      Фармацевт:`;
      
      let fullResponse = '';
      
      // Отправляем запрос к прокси-серверу (чтобы избежать CORS)
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            try {
              const json = JSON.parse(line.trim().substring(5));
              if (json.response) {
                fullResponse += json.response;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { 
                    role: 'assistant', 
                    content: fullResponse 
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Ошибка при запросе к Ollama:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Извините, произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Задайте вопрос о препаратах или здоровье..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Отправить
        </button>
      </form>
      
      {messages.length > 1 && (
        <div className="chat-actions">
          <a 
            href="https://wa.me/79001234567?text=Здравствуйте!%20Я%20обратился%20к%20чат-боту%20и%20хотел%20бы%20оформить%20заказ."
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
          >
            <i className="fab fa-whatsapp"></i> Перейти к заказу в WhatsApp
          </a>
        </div>
      )}
    </div>
  );
};

export default AIChat;
