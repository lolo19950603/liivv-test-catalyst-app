'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import {
  synthesizeChatVoiceAction,
  transcribeChatVoiceAction,
} from '~/app/[locale]/(default)/account/(portal)/virtual-care/_actions/virtual-care-actions';
import {
  createReplyingSound,
  playVoiceEndSound,
  playVoiceStartSound,
} from '~/components/virtual-care/replying-sound';

const SPEAK_REPLIES_KEY = 'liivv-chat-speak-replies';
const MAX_RECORD_MS = 45_000;
const SILENCE_MS = 1_350;
const MIN_SPEECH_MS = 500;
const SPEECH_RMS = 0.018;
const ANALYSIS_INTERVAL_MS = 50;

export type VoiceChatPhase = 'idle' | 'listening' | 'replying';

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function getRms(analyser: AnalyserNode, buffer: Float32Array): number {
  analyser.getFloatTimeDomainData(buffer);

  let sum = 0;

  for (let i = 0; i < buffer.length; i += 1) {
    const sample = buffer[i] ?? 0;
    sum += sample * sample;
  }

  return Math.sqrt(sum / buffer.length);
}

export function useChatVoice({
  enabled,
  disabled,
  onTranscript,
  onVoiceTurn,
}: {
  enabled: boolean;
  disabled?: boolean;
  onTranscript: (text: string) => void;
  /** When set, voice-chat mode auto-sends the transcript as a full turn. */
  onVoiceTurn?: (text: string) => boolean | void;
}) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const [dictateActive, setDictateActive] = useState(false);
  const [heardSpeech, setHeardSpeech] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const vadTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());
  const voiceChatActiveRef = useRef(false);
  const dictateActiveRef = useRef(false);
  const cancellingVoiceTurnRef = useRef(false);
  const listenAfterSpeakRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const speechStartedAtRef = useRef<number | null>(null);
  const lastLoudAtRef = useRef<number | null>(null);
  const enabledRef = useRef(enabled);
  const disabledRef = useRef(Boolean(disabled));
  const recordingRef = useRef(false);
  const transcribingRef = useRef(false);
  const speakingRef = useRef(false);
  const replyingSoundRef = useRef(createReplyingSound());

  const applyTranscript = useEffectEvent(onTranscript);
  const applyVoiceTurn = useEffectEvent((text: string) => onVoiceTurn?.(text));

  enabledRef.current = enabled;
  disabledRef.current = Boolean(disabled);
  recordingRef.current = recording;
  transcribingRef.current = transcribing;
  speakingRef.current = speaking;

  const voicePhase: VoiceChatPhase = recording
    ? 'listening'
    : transcribing ||
        synthesizing ||
        speaking ||
        (voiceChatActive && disabled)
      ? 'replying'
      : 'idle';

  const shouldPlayReplyingSound =
    voiceChatActive &&
    (transcribing || synthesizing || (disabled && !speaking));

  useEffect(() => {
    setMicSupported(
      typeof window !== 'undefined' &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== 'undefined',
    );

    try {
      setSpeakReplies(window.localStorage.getItem(SPEAK_REPLIES_KEY) === '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled && voiceChatActive) {
      endVoiceChat();
    }

    if (!enabled && dictateActiveRef.current) {
      stopRecording({ cancel: true });
      dictateActiveRef.current = false;
      setDictateActive(false);
      stopTracks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to assistant availability
  }, [enabled]);

  useEffect(() => {
    if (
      !voiceChatActive ||
      !enabled ||
      disabled ||
      recording ||
      transcribing ||
      speaking
    ) {
      return;
    }

    const id = window.setTimeout(() => {
      void startListeningTurn();
    }, 700);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resume listening if a turn stalls
  }, [voiceChatActive, enabled, disabled, recording, transcribing, speaking]);

  useEffect(() => {
    return () => {
      teardownSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  useEffect(() => {
    const sound = replyingSoundRef.current;

    if (shouldPlayReplyingSound) {
      sound.start();
    } else {
      sound.stop();
    }

    return () => {
      sound.stop();
    };
  }, [shouldPlayReplyingSound]);

  function clearRecordTimer() {
    if (recordTimerRef.current !== null) {
      window.clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }

  function clearVadTimer() {
    if (vadTimerRef.current !== null) {
      window.clearInterval(vadTimerRef.current);
      vadTimerRef.current = null;
    }
  }

  function stopAnalyser() {
    clearVadTimer();
    analyserRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
  }

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function teardownSession() {
    clearRecordTimer();
    clearVadTimer();
    stopAnalyser();

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === 'recording') {
      cancellingVoiceTurnRef.current = true;
      recorder.stop();
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    stopTracks();

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    audioRef.current?.pause();
    audioRef.current = null;
    replyingSoundRef.current.stop();
    dictateActiveRef.current = false;
    setDictateActive(false);
    setRecording(false);
    setSpeaking(false);
    setSynthesizing(false);
    setHeardSpeech(false);
  }

  async function ensureMicStream(): Promise<MediaStream> {
    if (streamRef.current) {
      const live = streamRef.current.getAudioTracks().some((track) => track.readyState === 'live');

      if (live) {
        return streamRef.current;
      }

      stopTracks();
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    streamRef.current = stream;

    return stream;
  }

  function startVad(stream: MediaStream) {
    stopAnalyser();

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return;
    }

    const audioContext = new AudioContextCtor();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    heardSpeechRef.current = false;
    speechStartedAtRef.current = null;
    lastLoudAtRef.current = null;
    setHeardSpeech(false);

    const buffer = new Float32Array(analyser.fftSize);

    void audioContext.resume().catch(() => undefined);

    vadTimerRef.current = window.setInterval(() => {
      const captureActive = voiceChatActiveRef.current || dictateActiveRef.current;

      if (!analyserRef.current || !captureActive || !recordingRef.current) {
        return;
      }

      const rms = getRms(analyserRef.current, buffer);
      const now = Date.now();

      if (rms >= SPEECH_RMS) {
        if (!heardSpeechRef.current) {
          heardSpeechRef.current = true;
          speechStartedAtRef.current = now;
          setHeardSpeech(true);
        }

        lastLoudAtRef.current = now;
        return;
      }

      if (!heardSpeechRef.current || !speechStartedAtRef.current || !lastLoudAtRef.current) {
        return;
      }

      // Dictate is confirmed manually — only continuous voice chat auto-stops on silence.
      if (dictateActiveRef.current && !voiceChatActiveRef.current) {
        return;
      }

      const spokeLongEnough = now - speechStartedAtRef.current >= MIN_SPEECH_MS;
      const silentLongEnough = now - lastLoudAtRef.current >= SILENCE_MS;

      if (spokeLongEnough && silentLongEnough) {
        stopRecording();
      }
    }, ANALYSIS_INTERVAL_MS);
  }

  async function finishRecording(recorder: MediaRecorder) {
    const mimeType = recorder.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const hadSpeech = heardSpeechRef.current;

    chunksRef.current = [];
    mediaRecorderRef.current = null;
    clearRecordTimer();
    stopAnalyser();
    setRecording(false);
    setHeardSpeech(false);
    heardSpeechRef.current = false;
    speechStartedAtRef.current = null;
    lastLoudAtRef.current = null;

    const wasDictating = dictateActiveRef.current;

    if (cancellingVoiceTurnRef.current) {
      cancellingVoiceTurnRef.current = false;
      dictateActiveRef.current = false;
      setDictateActive(false);

      if (wasDictating && !voiceChatActiveRef.current) {
        stopTracks();
      }

      return;
    }

    if (!blob.size || (!hadSpeech && !wasDictating)) {
      dictateActiveRef.current = false;
      setDictateActive(false);

      if (voiceChatActiveRef.current && enabledRef.current) {
        window.setTimeout(() => {
          void startListeningTurn();
        }, 250);
      } else if (wasDictating) {
        stopTracks();
      }

      return;
    }

    setTranscribing(true);
    setVoiceError(null);

    try {
      const formData = new FormData();
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';

      formData.append('audio', blob, `voice.${extension}`);

      const result = await transcribeChatVoiceAction(formData);

      if (!result.ok) {
        setVoiceError(result.error);
        dictateActiveRef.current = false;
        setDictateActive(false);

        if (voiceChatActiveRef.current && enabledRef.current) {
          window.setTimeout(() => {
            void startListeningTurn();
          }, 600);
        } else if (wasDictating) {
          stopTracks();
        }

        return;
      }

      const text = result.text.trim();

      if (!text) {
        dictateActiveRef.current = false;
        setDictateActive(false);

        if (voiceChatActiveRef.current && enabledRef.current) {
          window.setTimeout(() => {
            void startListeningTurn();
          }, 250);
        } else if (wasDictating) {
          stopTracks();
        }

        return;
      }

      if (voiceChatActiveRef.current) {
        const sent = applyVoiceTurn(text);

        if (sent === false) {
          applyTranscript(text);
          setVoiceError('Could not send that message. Try again.');

          if (voiceChatActiveRef.current && enabledRef.current) {
            window.setTimeout(() => {
              void startListeningTurn();
            }, 600);
          }
        }
      } else {
        applyTranscript(text);
      }
    } catch {
      setVoiceError('Could not transcribe that recording.');

      if (voiceChatActiveRef.current && enabledRef.current) {
        window.setTimeout(() => {
          void startListeningTurn();
        }, 600);
      }
    } finally {
      if (wasDictating) {
        dictateActiveRef.current = false;
        setDictateActive(false);

        if (!voiceChatActiveRef.current) {
          stopTracks();
        }
      }

      setTranscribing(false);
    }
  }

  async function beginRecordingCapture({ forDictate }: { forDictate: boolean }) {
    if (
      !enabledRef.current ||
      disabledRef.current ||
      recordingRef.current ||
      transcribingRef.current ||
      speakingRef.current ||
      !micSupported
    ) {
      return false;
    }

    if (!forDictate && !voiceChatActiveRef.current) {
      return false;
    }

    if (forDictate && voiceChatActiveRef.current) {
      return false;
    }

    setVoiceError(null);
    cancellingVoiceTurnRef.current = false;

    try {
      const stream = await ensureMicStream();
      const mimeType = pickRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        void finishRecording(recorder);
      };

      recorder.start(250);
      setRecording(true);
      recordingRef.current = true;
      startVad(stream);

      clearRecordTimer();
      recordTimerRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, MAX_RECORD_MS);

      return true;
    } catch {
      stopTracks();
      setRecording(false);
      setVoiceError(
        forDictate
          ? 'Microphone access is required for dictation.'
          : 'Microphone access is required for voice chat.',
      );

      if (forDictate) {
        dictateActiveRef.current = false;
        setDictateActive(false);
      } else {
        voiceChatActiveRef.current = false;
        setVoiceChatActive(false);
      }

      return false;
    }
  }

  async function startListeningTurn() {
    if (!voiceChatActiveRef.current) {
      return;
    }

    await beginRecordingCapture({ forDictate: false });
  }

  async function startDictate() {
    if (!enabled || !micSupported || disabled || voiceChatActive || recording || transcribing) {
      return;
    }

    dictateActiveRef.current = true;
    setDictateActive(true);
    stopSpeaking();

    const started = await beginRecordingCapture({ forDictate: true });

    if (!started && !recordingRef.current) {
      dictateActiveRef.current = false;
      setDictateActive(false);
    }
  }

  /** Finish dictation and insert the transcript into the input. */
  function confirmDictate() {
    if (!dictateActiveRef.current || transcribingRef.current) {
      return;
    }

    stopRecording();
  }

  function cancelDictate() {
    if (!dictateActiveRef.current && !recordingRef.current) {
      return;
    }

    stopRecording({ cancel: true });
    dictateActiveRef.current = false;
    setDictateActive(false);
    stopTracks();
  }

  function toggleDictate() {
    if (dictateActive) {
      cancelDictate();
      return;
    }

    void startDictate();
  }

  function stopRecording({ cancel = false }: { cancel?: boolean } = {}) {
    clearRecordTimer();
    clearVadTimer();
    cancellingVoiceTurnRef.current = cancel;

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    } else {
      setRecording(false);
    }
  }

  function setSpeakRepliesPersisted(next: boolean) {
    setSpeakReplies(next);

    try {
      window.localStorage.setItem(SPEAK_REPLIES_KEY, next ? '1' : '0');
    } catch {
      // ignore
    }
  }

  function toggleSpeakReplies() {
    setSpeakReplies((prev) => {
      const next = !prev;

      try {
        window.localStorage.setItem(SPEAK_REPLIES_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }

      if (!next) {
        stopSpeaking();
      }

      return next;
    });
  }

  function rememberExistingBotMessages(messageIds: string[]) {
    for (const id of messageIds) {
      spokenMessageIdsRef.current.add(id);
    }
  }

  function stopSpeaking() {
    listenAfterSpeakRef.current = false;
    audioRef.current?.pause();

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setSpeaking(false);
    speakingRef.current = false;
    setSynthesizing(false);
  }

  async function speakText(text: string, messageId?: string) {
    if (!enabled || !text.trim()) {
      return;
    }

    if (messageId) {
      spokenMessageIdsRef.current.add(messageId);
    }

    stopSpeaking();
    setVoiceError(null);
    setSpeaking(true);
    speakingRef.current = true;
    setSynthesizing(true);
    listenAfterSpeakRef.current = voiceChatActiveRef.current;

    try {
      const result = await synthesizeChatVoiceAction(text);

      if (!result.ok) {
        setSpeaking(false);
        speakingRef.current = false;
        setSynthesizing(false);
        setVoiceError(result.error);

        if (voiceChatActiveRef.current && enabledRef.current) {
          window.setTimeout(() => {
            void startListeningTurn();
          }, 500);
        }

        return;
      }

      const binary = atob(result.audioBase64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }

      const url = URL.createObjectURL(new Blob([bytes], { type: result.mimeType }));

      audioUrlRef.current = url;

      const audio = new Audio(url);

      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        speakingRef.current = false;

        if (audioUrlRef.current === url) {
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
        }

        if (listenAfterSpeakRef.current && voiceChatActiveRef.current && enabledRef.current) {
          listenAfterSpeakRef.current = false;
          // Brief gap so TTS echo doesn't trip VAD.
          window.setTimeout(() => {
            void startListeningTurn();
          }, 400);
        }
      };
      setSynthesizing(false);

      audio.onerror = () => {
        setSpeaking(false);
        speakingRef.current = false;
        setVoiceError('Could not play the voice reply.');

        if (voiceChatActiveRef.current && enabledRef.current) {
          window.setTimeout(() => {
            void startListeningTurn();
          }, 500);
        }
      };

      await audio.play();
    } catch {
      setSpeaking(false);
      speakingRef.current = false;
      setSynthesizing(false);
      setVoiceError('Could not play the voice reply.');

      if (voiceChatActiveRef.current && enabledRef.current) {
        window.setTimeout(() => {
          void startListeningTurn();
        }, 500);
      }
    }
  }

  function maybeSpeakBotReply(messageId: string, body: string) {
    // Auto-play replies only during continuous voice chat — not while typing or dictating.
    if (!voiceChatActiveRef.current || !enabled || spokenMessageIdsRef.current.has(messageId)) {
      return;
    }

    if (messageId.startsWith('optimistic-')) {
      return;
    }

    void speakText(body, messageId);
  }

  function startVoiceChat() {
    if (!enabled || !micSupported || disabled) {
      return;
    }

    if (dictateActiveRef.current) {
      dictateActiveRef.current = false;
      setDictateActive(false);
      stopRecording({ cancel: true });
    }

    voiceChatActiveRef.current = true;
    setVoiceChatActive(true);
    setSpeakRepliesPersisted(true);
    setVoiceError(null);
    void (async () => {
      const started = await beginRecordingCapture({ forDictate: false });

      if (started) {
        playVoiceStartSound();
      }
    })();
  }

  function endVoiceChat() {
    voiceChatActiveRef.current = false;
    setVoiceChatActive(false);
    listenAfterSpeakRef.current = false;
    setSpeakRepliesPersisted(false);
    stopSpeaking();
    teardownSession();
    playVoiceEndSound();
  }

  function toggleVoiceChat() {
    if (voiceChatActive) {
      endVoiceChat();
      return;
    }

    startVoiceChat();
  }

  /** Start continuous voice chat, or end it if already active. */
  function handleVoiceChatPrimaryAction() {
    toggleVoiceChat();
  }

  return {
    micSupported,
    recording,
    transcribing,
    speaking,
    heardSpeech,
    speakReplies,
    voiceChatActive,
    dictateActive,
    voicePhase,
    voiceError,
    voiceBusy: recording || transcribing || speaking,
    clearVoiceError: () => setVoiceError(null),
    toggleSpeakReplies,
    toggleVoiceChat,
    handleVoiceChatPrimaryAction,
    endVoiceChat,
    toggleDictate,
    startDictate,
    confirmDictate,
    cancelDictate,
    speakText,
    stopSpeaking,
    maybeSpeakBotReply,
    rememberExistingBotMessages,
  };
}
