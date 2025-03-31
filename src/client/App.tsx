import { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import ControlPanel from './components/ControlPanel';
import './App.css';

// 扩展全局Window类型声明
declare global {
  interface Window {
    ws: WebSocket;
  }
}

export default function App() {
  const [rtspUrl, setRtspUrl] = useState('rtsp://192.168.1.1/live');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // 初始化WebSocket连接
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    window.ws = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  // 处理RTSP地址更新
  const handleRtspUpdate = (newUrl: string) => {
    setRtspUrl(newUrl);
    // 通知后端更新视频流
    fetch('/update-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newUrl }),
    });
  };

  return (
    <div className="app-container">
      <div className="status-bar">
        <span className={`status-indicator ${connectionStatus}`} />
        {connectionStatus.toUpperCase()}
      </div>

      <div className="main-content">
        <VideoPlayer 
          src={rtspUrl}
          type="rtsp" 
        />
        
        <ControlPanel 
          onRtspUpdate={handleRtspUpdate}
        />
      </div>
    </div>
  );
}
