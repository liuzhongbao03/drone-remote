import WebSocket from 'ws';
import droneController from './drone-controller';

export function createWebSocketServer(server: any) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    // 保存全局引用
    (global as any).ws = ws;

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'params_update') {
        droneController.updateParams(message.data);
      }
    });

    // 定时发送状态更新
    const interval = setInterval(() => {
      ws.send(JSON.stringify({
        type: 'status_update',
        data: droneController.getStatus()
      }));
    }, 1000);

    ws.on('close', () => clearInterval(interval));
  });
}
