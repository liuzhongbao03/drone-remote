// 无人机状态类型
export type DroneStatus = {
  altitude: number;
  speed: number;
  battery: number;
  signalStrength: number;
};

// 控制指令类型
export type ControlCommand = {
  type: 'speed' | 'altitude' | 'cameraTilt';
  value: number;
};

// 视频流配置
export type StreamConfig = {
  protocol: 'rtsp' | 'webrtc';
  url: string;
  resolution: '480p' | '720p' | '1080p';
};
