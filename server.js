import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// 环境配置
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// 无人机状态模拟
let droneState = {
  connected: false,
  battery: 100,
  position: { x: 0, y: 0, z: 0 },
  speed: 1.0
};

// Express 服务初始化
const app = express();
const server = createServer(app);

// 中间件
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// 静态文件服务（用于生产环境）
app.use(express.static(path.join(__dirname, 'dist')));

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// WebSocket 服务初始化
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WebSocket] 客户端已连接');

  // 发送初始状态
  ws.send(JSON.stringify({
    type: 'STATUS_UPDATE',
    payload: droneState
  }));

  // 指令处理
  ws.on('message', (data) => {
    try {
      const command = JSON.parse(data);
      console.log(`[控制指令]`, command);

      // 指令路由
      switch (command.type) {
        case 'TAKEOFF':
          droneState = { ...droneState, connected: true };
          break;

        case 'LAND':
          droneState = { ...droneState, connected: false };
          break;

        case 'MOVE':
          droneState.position = {
            x: droneState.position.x + (command.payload.x || 0),
            y: droneState.position.y + (command.payload.y || 0),
            z: droneState.position.z + (command.payload.z || 0)
          };
          break;

        default:
          console.warn('未知指令类型:', command.type);
      }

      // 广播状态更新
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'STATUS_UPDATE',
            payload: droneState
          }));
        }
      });

    } catch (err) {
      console.error('指令解析失败:', err);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] 客户端断开连接');
  });
});

// 启动服务
server.listen(PORT, () => {
  console.log(`
  ██████╗ ██████╗  ██████╗ ███╗   ██╗███████╗
  ██╔══██╗██╔══██╗██╔═══██╗████╗  ██║██╔════╝
  ██║  ██║██████╔╝██║   ██║██╔██╗ ██║█████╗  
  ██║  ██║██╔══██╗██║   ██║██║╚██╗██║██╔══╝  
  ██████╔╝██║  ██║╚██████╔╝██║ ╚████║███████╗
  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
  
  服务已启动: http://localhost:${PORT}
  等待无人机连接...`);
});

// 错误处理
server.on('error', (err) => {
  console.error('服务器错误:', err);
  process.exit(1);
});
