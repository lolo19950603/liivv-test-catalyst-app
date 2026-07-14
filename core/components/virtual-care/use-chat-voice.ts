'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import {
  synthesizeChatVoiceAction,
  transcribeChatVoiceAction,
} from '~/app/[locale]/(default)/account/(portal)/virtual-care/_actions/virtual-care-actions';

const SPEAK_REPLIES_KEY = 'liivv-chat-speak-replies';
const MAX_RECORD_MS = 60_000;

export type VoiceChatPhase = 'idle' | 'listening' | 'thinking' | 'speaking';

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
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
  const [speakReplies, setSpeakReplies] = useState(false);
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());
  const voiceChatActiveRef = useRef(false);
  const cancellingVoiceTurnRef = useRef(false);
  const listenAfterSpeakRef = useRef(false);

  const applyTranscript = useEffectEvent(onTranscript);
  const applyVoiceTurn = useEffectEvent((text: string) => onVoiceTurn?.(text));

  const voicePhase: VoiceChatPhase = recording
    ? 'listening'
    : transcribing || (voiceChatActive && disabled && !speaking)
      ? 'thinking'
      : speaking
        ? 'speaking'
        : 'idle';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to assistant availability
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current !== null) {
        window.clearTimeout(recordTimerRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      audioRef.current?.pause();
    };
  }, []);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function finishRecording(recorder: MediaRecorder) {
    const mimeType = recorder.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });

    chunksRef.current = [];
    stopTracks();
    setRecording(false);

    if (cancellingVoiceTurnRef.current) {
      cancellingVoiceTurnRef.current = false;
      return;
    }

    if (!blob.size) {
      setVoiceError('No audio captured. Please try again.');
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
        return;
      }

      if (voiceChatActiveRef.current) {
        const sent = applyVoiceTurn(result.text);

        if (sent === false) {
          applyTranscript(result.text);
          setVoiceError('Could not send that message. Try again.');
        }
      } else {
        applyTranscript(result.text);
      }
    } catch {
      setVoiceError('Could not transcribe that recording.');
    } finally {
      setTranscribing(false);
    }
  }

  async function startRecording() {
    if (!enabled || disabled || recording || transcribing || speaking || !micSupported) {
      return;
    }

    setVoiceError(null);
    cancellingVoiceTurnRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
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

      recorder.start();
      setRecording(true);

      if (recordTimerRef.current !== null) {
        window.clearTimeout(recordTimerRef.current);
      }

      recordTimerRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORD_MS);
    } catch {
      stopTracks();
      setRecording(false);
      setVoiceError('Microphone access is required for voice chat.');
      if (voiceChatActiveRef.current) {
        voiceChatActiveRef.current = false;
        setVoiceChatActive(false);
      }
    }
  }

  function stopRecording({ cancel = false }: { cancel?: boolean } = {}) {
    if (recordTimerRef.current !== null) {
      window.clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    cancellingVoiceTurnRef.current = cancel;

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    } else {
      stopTracks();
      setRecording(false);
    }
  }

  function toggleRecording() {
    if (recording) {
      stopRecording();
      return;
    }

    void startRecording();
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
    listenAfterSpeakRef.current = voiceChatActiveRef.current;

    try {
      const result = await synthesizeChatVoiceAction(text);

      if (!result.ok) {
        setSpeaking(false);
        setVoiceError(result.error);
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

        if (audioUrlRef.current === url) {
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
        }

        if (listenAfterSpeakRef.current && voiceChatActiveRef.current && enabled) {
          listenAfterSpeakRef.current = false;
          void startRecording();
        }
      };
      audio.onerror = () => {
        setSpeaking(false);
        setVoiceError('Could not play the voice reply.');
      };

      await audio.play();
    } catch {
      setSpeaking(false);
      setVoiceError('Could not play the voice reply.');
    }
  }

  function maybeSpeakBotReply(messageId: string, body: string) {
    const shouldSpeak = speakReplies || voiceChatActiveRef.current;

    if (!shouldSpeak || !enabled || spokenMessageIdsRef.current.has(messageId)) {
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

    voiceChatActiveRef.current = true;
    setVoiceChatActive(true);
    setSpeakRepliesPersisted(true);
    setVoiceError(null);
    void startRecording();
  }

  function endVoiceChat() {
    voiceChatActiveRef.current = false;
    setVoiceChatActive(false);
    listenAfterSpeakRef.current = false;
    stopRecording({ cancel: recording });
    stopSpeaking();
  }

  function toggleVoiceChat() {
    if (voiceChatActive) {
      endVoiceChat();
      return;
    }

    startVoiceChat();
  }

  /** While voice chat is listening, tap again to finish the turn. */
  function handleVoiceChatPrimaryAction() {
    if (!voiceChatActive) {
      startVoiceChat();
      return;
    }

    if (recording) {
      stopRecording();
      return;
    }

    if (speaking || transcribing || disabled) {
      return;
    }

    void startRecording();
  }

  return {
    micSupported,
    recording,
    transcribing,
    speaking,
    speakReplies,
    voiceChatActive,
    voicePhase,
    voiceError,
    voiceBusy: recording || transcribing || speaking,
    clearVoiceError: () => setVoiceError(null),
    toggleRecording,
    toggleSpeakReplies,
    toggleVoiceChat,
    handleVoiceChatPrimaryAction,
    endVoiceChat,
    speakText,
    stopSpeaking,
    maybeSpeakBotReply,
    rememberExistingBotMessages,
  };
}
