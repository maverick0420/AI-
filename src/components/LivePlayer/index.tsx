import React, { useEffect, useRef } from 'react';
import flvjs from 'flv.js';
import { LiveRoom } from '../../types';
import styles from './LivePlayer.module.css';

interface LivePlayerProps {
  room: LiveRoom;
}

const LivePlayer: React.FC<LivePlayerProps> = ({ room }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<flvjs.Player | null>(null);

  useEffect(() => {
    if (flvjs.isSupported() && videoRef.current) {
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: `http://localhost:8000/live/${room.streamKey}.flv`
      });
      
      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();
      flvPlayer.play();

      playerRef.current = flvPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [room.streamKey]);

  return (
    <div className={styles.player}>
      <video
        ref={videoRef}
        controls
        autoPlay
        className={styles.video}
      />
    </div>
  );
};

export default LivePlayer; 