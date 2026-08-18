'use client';

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function prefersSaveData() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

  return connection?.saveData === true;
}

export function HeroLoopVideo({
  className,
  poster,
  src,
}: {
  className?: string;
  poster: string;
  src: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || prefersSaveData()) {
      return;
    }

    setUseVideo(true);
  }, []);

  useEffect(() => {
    if (!useVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const rect = video.getBoundingClientRect();
    let inView = rect.bottom > 0 && rect.top < window.innerHeight;
    let pageVisible = document.visibilityState === 'visible';
    let cancelled = false;

    const syncPlayback = () => {
      if (cancelled) return;

      if (inView && pageVisible) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        syncPlayback();
      },
      { threshold: 0.2 },
    );

    observer.observe(video);

    const onVisibility = () => {
      pageVisible = document.visibilityState === 'visible';
      syncPlayback();
    };

    document.addEventListener('visibilitychange', onVisibility);
    syncPlayback();

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      video.pause();
    };
  }, [src, useVideo]);

  return (
    <>
      <img
        alt=""
        decoding="async"
        src={poster}
        style={playing ? { visibility: 'hidden' } : undefined}
      />
      {useVideo ? (
        <video
          ref={videoRef}
          className={className}
          disablePictureInPicture
          disableRemotePlayback
          loop
          muted
          onPlaying={() => setPlaying(true)}
          playsInline
          poster={poster}
          preload="none"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
