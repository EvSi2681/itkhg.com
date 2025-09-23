// chat.js
document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chat-container');
  const input = document.getElementById('chat-input');
  const submitBtn = document.getElementById('submit-btn');

  submitBtn.addEventListener('click', async () => {
    if (!input.value.trim()) return;

    // Добавьте сообщение пользователя
    chatContainer.innerHTML += `
      <div class="message user">
        <div>${input.value}</div>
      </div>
    `;
    input.value = '';

    // Моделирование ответа от Ollama (замените на реальный API)
    setTimeout(() => {
      chatContainer.innerHTML += `
        <div class="message assistant">
          <div>Извините, чат временно недоступен. Попробуйте позже.</div>
        </div>
      `;
    }, 1000);
  });
});
