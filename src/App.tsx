import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');
  const [question, setQuestion] = useState('');
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [dailyQuote, setDailyQuote] = useState<any>(null);
  const [meditationMinutes, setMeditationMinutes] = useState<number>(5);

  // 增加计数函数 - 代表增加修行次数
  const increment = () => setCount(prev => prev + 1);
  
  // 减少计数函数 - 代表减少修行次数
  const decrement = () => setCount(prev => Math.max(0, prev - 1));
  
  // 重置计数函数 - 代表重新开始修行
  const reset = () => setCount(0);

  // 从后端获取佛学智慧的函数
  const fetchWisdom = async () => {
    try {
      const response = await invoke<{ message: string }>('wisdom', { question: question || '请赐予我智慧' });
      setMessage(response.message);
    } catch (error) {
      console.error('获取智慧时出错:', error);
      setMessage('无法获取智慧，请静心片刻后再试');
    }
  };

  // 获取系统信息的函数
  const fetchSystemInfo = async () => {
    try {
      const info = await invoke('get_system_info');
      setSystemInfo(info);
    } catch (error) {
      console.error('获取系统信息时出错:', error);
    }
  };

  // 获取每日佛学箴言
  const fetchDailyQuote = async () => {
    try {
      const quote = await invoke('get_daily_quote');
      setDailyQuote(quote);
    } catch (error) {
      console.error('获取每日箴言时出错:', error);
    }
  };

  // 记录禅修时间
  const logMeditation = async () => {
    try {
      const result = await invoke('log_meditation', { durationMinutes: meditationMinutes });
      console.log('禅修记录结果:', result);
      // 可以在这里添加成功提示
    } catch (error) {
      console.error('记录禅修时间时出错:', error);
    }
  };

  // 组件挂载时获取系统信息和每日箴言
  useEffect(() => {
    fetchSystemInfo();
    fetchDailyQuote();
  }, []);

  return (
    <div className="container">
      <h1>智慧圆觉 · 佛学修行助手</h1>
      
      {dailyQuote && (
        <div className="card daily-quote">
          <div className="quote-content">
            <span className="quote-symbol">☸</span> {/* 法轮符号 */}
            <p className="quote-text">{dailyQuote.text}</p>
            <p className="quote-author">—— {dailyQuote.author}</p>
          </div>
        </div>
      )}
      
      <div className="card">
        <h2>
          <span className="buddhist-symbol">☸</span> 念珠计数器
        </h2>
        <div className="counter-display">{count}</div>
        <p className="counter-description">您已完成 {count} 次修行</p>
        <div className="button-group">
          <button onClick={decrement} className="button decrement">
            减少
          </button>
          <button onClick={reset} className="button reset">
            重置
          </button>
          <button onClick={increment} className="button increment">
            增加
          </button>
        </div>
      </div>

      <div className="card">
        <h2>
          <span className="buddhist-symbol">✿</span> 求取智慧
        </h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="请输入您的疑惑或问题..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={fetchWisdom} className="button">
            求智慧
          </button>
        </div>
        {message && <div className="message-display">{message}</div>}
      </div>

      <div className="card">
        <h2>
          <span className="buddhist-symbol">ॐ</span> 禅修记录
        </h2>
        <div className="meditation-container">
          <p className="meditation-description">记录您今日的禅修时间</p>
          <div className="input-group">
            <input
              type="number"
              min="1"
              max="180"
              value={meditationMinutes}
              onChange={(e) => setMeditationMinutes(parseInt(e.target.value) || 5)}
            />
            <span className="time-unit">分钟</span>
            <button onClick={logMeditation} className="button">
              记录禅修
            </button>
          </div>
        </div>
      </div>

      {systemInfo && (
        <div className="card">
          <h2>
            <span className="buddhist-symbol">☯</span> 寺院信息
          </h2>
          <div className="system-info">
            <p><strong>修行环境:</strong> {systemInfo.os}</p>
            <p><strong>结构:</strong> {systemInfo.arch}</p>
            <p><strong>核心数:</strong> {systemInfo.cpu_count}</p>
            <p><strong>版本:</strong> {systemInfo.app_version}</p>
          </div>
        </div>
      )}

      <p className="read-the-docs">
        以慈悲心，行菩提道 · 以智慧光，照无明暗
      </p>
    </div>
  );
}

export default App;
