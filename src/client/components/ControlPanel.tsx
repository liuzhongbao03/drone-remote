import { useState } from 'react';
import { Button, InputNumber, Slider } from 'antd-mobile';

export default function ControlPanel() {
  const [rtspUrl, setRtspUrl] = useState('rtsp://192.168.1.1/live');
  const [params, setParams] = useState({
    speed: 50,
    altitude: 100,
    cameraTilt: 0
  });

  const sendCommand = (type: string, value: number) => {
    const newParams = { ...params, [type]: value };
    setParams(newParams);
    
    // 通过WebSocket发送指令
    window.ws.send(JSON.stringify({
      type: 'params_update',
      data: newParams
    }));
  };

  return (
    <div className="control-panel">
      <div className="connection-form">
        <input
          type="text"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          placeholder="输入RTSP地址"
        />
        <Button onClick={() => window.location.reload()}>连接</Button>
      </div>

      <div className="param-item">
        <label>飞行速度: {params.speed}%</label>
        <Slider
          min={0}
          max={100}
          value={params.speed}
          onChange={(v) => sendCommand('speed', v)}
        />
      </div>

      <div className="param-item">
        <label>云台角度: {params.cameraTilt}°</label>
        <InputNumber
          min={-90}
          max={90}
          value={params.cameraTilt}
          onChange={(v) => sendCommand('cameraTilt', v)}
        />
      </div>
    </div>
  );
}
