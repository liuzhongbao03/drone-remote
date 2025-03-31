import { spawn } from 'child_process';
import express from 'express';
import ffmpegPath from 'ffmpeg-static';

const app = express();

// RTSP转HLS服务
app.get('/rtsp-proxy', (req, res) => {
  const rtspUrl = decodeURIComponent(req.query.url as string);
  
  const args = [
    '-rtsp_transport', 'tcp',
    '-i', rtspUrl,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    'pipe:1'
  ];

  const ffmpeg = spawn(ffmpegPath!, args);
  
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  ffmpeg.stdout.pipe(res);
  
  req.on('close', () => ffmpeg.kill());
});
