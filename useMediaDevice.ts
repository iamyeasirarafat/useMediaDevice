import { useCallback, useEffect, useState } from "react";

type DeviceInfo = {
  deviceId: string;
  groupId: string;
  kind: MediaDeviceKind;
  label: string;
};

type CameraDeviceInfo = DeviceInfo & { kind: "videoinput" };
type MicrophoneDeviceInfo = DeviceInfo & { kind: "audioinput" };
type PlaybackDeviceInfo = DeviceInfo & { kind: "audiooutput" };

type Permission = "camera" | "microphone" | "speaker";

export default function useMediaDevice({
  onDeviceChanged,
}: {
  onDeviceChanged?: (devices: Array<DeviceInfo>) => void;
} = {}) {
  const [devices, setDevices] = useState<Array<DeviceInfo>>([]);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  const updateDevices = useCallback(async () => {
    const newDevices = await navigator.mediaDevices.enumerateDevices();
    setDevices(newDevices);
    if (onDeviceChanged) {
      onDeviceChanged(newDevices);
    }
  }, [onDeviceChanged]);

  useEffect(() => {
    updateDevices();

    navigator.mediaDevices.addEventListener("devicechange", updateDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [updateDevices, activeStream]);

  const getDevices = useCallback((): Promise<Array<DeviceInfo>> => {
    return navigator.mediaDevices.enumerateDevices();
  }, []);

  const getCameras = useCallback(async (): Promise<Array<CameraDeviceInfo>> => {
    const devices = await getDevices();
    return devices.filter(
      (device): device is CameraDeviceInfo => device.kind === "videoinput"
    );
  }, [getDevices]);

  const getMicrophones = useCallback(async (): Promise<
    Array<MicrophoneDeviceInfo>
  > => {
    const devices = await getDevices();
    return devices.filter(
      (device): device is MicrophoneDeviceInfo => device.kind === "audioinput"
    );
  }, [getDevices]);

  const getPlaybackDevices = useCallback(async (): Promise<
    Array<PlaybackDeviceInfo>
  > => {
    const devices = await getDevices();
    return devices.filter(
      (device): device is PlaybackDeviceInfo => device.kind === "audiooutput"
    );
  }, [getDevices]);

  const checkPermissions = useCallback(
    async (permissions?: Permission): Promise<Map<string, boolean>> => {
      const result = new Map<string, boolean>();
      const queryOpts: PermissionDescriptor[] = [];

      if (!permissions || permissions === "camera")
        queryOpts.push({ name: "camera" });
      if (!permissions || permissions === "microphone")
        queryOpts.push({ name: "microphone" });

      for (const opt of queryOpts) {
        const permission = await navigator.permissions.query(opt);
        result.set(opt.name, permission.state === "granted");
      }

      return result;
    },
    []
  );

  const requestPermission = useCallback(
    async (permissions?: Permission): Promise<Map<string, boolean>> => {
      const constraints: MediaStreamConstraints = {};

      if (!permissions || permissions === "camera") constraints.video = true;
      if (!permissions || permissions === "microphone")
        constraints.audio = true;

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => track.stop());

        return checkPermissions(permissions);
      } catch (error) {
        console.error("Error requesting permission:", error);
        return checkPermissions(permissions);
      }
    },
    [checkPermissions]
  );

  const toggleMicrophone = useCallback(
    async (deviceId?: string): Promise<boolean> => {
      if (activeStream) {
        const audioTrack = activeStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          return audioTrack.enabled;
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        if (activeStream) {
          activeStream.getAudioTracks().forEach((track) => track.stop());
          stream
            .getVideoTracks()
            .forEach((track) => activeStream.addTrack(track));
        }
        setActiveStream(stream);
        return true;
      } catch (error) {
        console.error("Error toggling microphone:", error);
        return false;
      }
    },
    [activeStream]
  );

  const toggleCamera = useCallback(
    async (deviceId?: string): Promise<boolean> => {
      if (activeStream) {
        const videoTrack = activeStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          return videoTrack.enabled;
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        if (activeStream) {
          activeStream.getVideoTracks().forEach((track) => track.stop());
          stream
            .getAudioTracks()
            .forEach((track) => activeStream.addTrack(track));
        }
        setActiveStream(stream);
        return true;
      } catch (error) {
        console.error("Error toggling camera:", error);
        return false;
      }
    },
    [activeStream]
  );

  return {
    getDevices,
    getCameras,
    getMicrophones,
    getPlaybackDevices,
    checkPermissions,
    requestPermission,
    toggleMicrophone,
    toggleCamera,
  };
}
