import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoProps {
  src: string;
  type: 'rtsp' | 'webrtc';
}

export default function VideoPlayer({ src, type }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // RTSP转HLS播放
    if (type === 'rtsp') {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(`/rtsp-proxy?url=${encodeURIComponent(src)}`);
        hls.attachMedia(video);
      }
    }
    // WebRTC直连
    else if (type === 'webrtc') {
      const pc = new RTCPeerConnection();
      pc.addTransceiver('video', { direction: 'recvonly' });
      
      pc.ontrack = (event) => {
        video.srcObject = event.streams;
      };
      
      // 建立WebRTC连接
      connectWebRTC(pc, src);
    }

    return () => video.srcObject = null;
  }, [src, type]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      controls={false}
      style={{ width: '100%', height: 'auto' }}
    />
  );
}

async function connectWebRTC(pc: RTCPeerConnection, url: string) {
  const response = await fetch(`/webrtc-offer`, {
    method: 'POST',
    body: JSON.stringify({ url })
  });
  
  const { sdp } = await response.json();
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
}
