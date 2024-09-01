# useMediaDevice Hook

`useMediaDevice` is a custom React hook that provides a simple interface for managing media devices and permissions in web applications.

## Usage

Import the hook into your React component:

```javascript
import useMediaDevice from "@/hooks/useMediaDevice";
```

Then use it in your component:

```javascript
function MyComponent() {
  const {
    getDevices,
    getCameras,
    getMicrophones,
    getPlaybackDevices,
    checkPermissions,
    requestPermission,
    toggleMicrophone,
    toggleCamera,
  } = useMediaDevice();

  // Use the functions here
}
```

## API

The `useMediaDevice` hook returns an object with the following functions:

### `getDevices(): Promise<Array<DeviceInfo>>`

Returns a promise that resolves to an array of all media devices.

```javascript
const devices = await getDevices();
console.log(devices);
```

### `getCameras(): Promise<Array<CameraDeviceInfo>>`

Returns a promise that resolves to an array of available camera devices.

```javascript
const cameras = await getCameras();
console.log(cameras);
```

### `getMicrophones(): Promise<Array<MicrophoneDeviceInfo>>`

Returns a promise that resolves to an array of available microphone devices.

```javascript
const microphones = await getMicrophones();
console.log(microphones);
```

### `getPlaybackDevices(): Promise<Array<PlaybackDeviceInfo>>`

Returns a promise that resolves to an array of available audio output devices.

```javascript
const speakers = await getPlaybackDevices();
console.log(speakers);
```

### `checkPermissions(permissions?: Permission): Promise<Map<string, boolean>>`

Checks the current permission status for camera and/or microphone.

```javascript
const permissions = await checkPermissions();
console.log(permissions.get("camera")); // true or false
console.log(permissions.get("microphone")); // true or false
```

### `requestPermission(permissions?: Permission): Promise<Map<string, boolean>>`

Requests permission for camera and/or microphone access.

```javascript
const permissions = await requestPermission("camera");
if (permissions.get("camera")) {
  console.log("Camera permission granted");
}
```

### `toggleMicrophone(deviceId?: string): Promise<boolean>`

Toggles the microphone on/off. Returns a promise that resolves to the new state (true if on, false if off).

If a `deviceId` is provided, it will toggle that specific microphone.

```javascript
// Toggle default microphone
const isMicOn = await toggleMicrophone();
console.log(`Microphone is now ${isMicOn ? "on" : "off"}`);

// Toggle specific microphone
const specificMicId = "your-mic-device-id";
const isSpecificMicOn = await toggleMicrophone(specificMicId);
console.log(`Specific microphone is now ${isSpecificMicOn ? "on" : "off"}`);
```

### `toggleCamera(deviceId?: string): Promise<boolean>`

Toggles the camera on/off. Returns a promise that resolves to the new state (true if on, false if off).

If a `deviceId` is provided, it will toggle that specific camera.

```javascript
// Toggle default camera
const isCameraOn = await toggleCamera();
console.log(`Camera is now ${isCameraOn ? "on" : "off"}`);

// Toggle specific camera
const specificCameraId = "your-camera-device-id";
const isSpecificCameraOn = await toggleCamera(specificCameraId);
console.log(`Specific camera is now ${isSpecificCameraOn ? "on" : "off"}`);
```

## Example

Here's a simple example of how to use the hook:

```javascript
"use client";

import React, { useEffect, useState } from "react";
import useMediaDevice from "@/hooks/useMediaDevice";

function MediaControl() {
  const {
    checkPermissions,
    requestPermission,
    toggleMicrophone,
    toggleCamera,
    getMicrophones,
    getCameras,
  } = useMediaDevice();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [microphones, setMicrophones] = useState([]);
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    checkPermissions().then((perms) => {
      setHasPermissions(perms.get("camera") && perms.get("microphone"));
    });

    getMicrophones().then(setMicrophones);
    getCameras().then(setCameras);
  }, []);

  const handleRequestPermissions = async () => {
    const perms = await requestPermission();
    setHasPermissions(perms.get("camera") && perms.get("microphone"));
  };

  const handleToggleMic = async (deviceId) => {
    const isOn = await toggleMicrophone(deviceId);
    console.log(
      `Microphone ${deviceId || "default"} is now ${isOn ? "on" : "off"}`
    );
  };

  const handleToggleCamera = async (deviceId) => {
    const isOn = await toggleCamera(deviceId);
    console.log(
      `Camera ${deviceId || "default"} is now ${isOn ? "on" : "off"}`
    );
  };

  return (
    <div>
      {!hasPermissions && (
        <button onClick={handleRequestPermissions}>Request Permissions</button>
      )}
      {hasPermissions && (
        <>
          <button onClick={() => handleToggleMic()}>Toggle Default Mic</button>
          <button onClick={() => handleToggleCamera()}>
            Toggle Default Camera
          </button>

          <h3>Microphones</h3>
          {microphones.map((mic) => (
            <button
              key={mic.deviceId}
              onClick={() => handleToggleMic(mic.deviceId)}
            >
              Toggle {mic.label || `Mic ${mic.deviceId}`}
            </button>
          ))}

          <h3>Cameras</h3>
          {cameras.map((camera) => (
            <button
              key={camera.deviceId}
              onClick={() => handleToggleCamera(camera.deviceId)}
            >
              Toggle {camera.label || `Camera ${camera.deviceId}`}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

export default MediaControl;
```

This example demonstrates how to check and request permissions, how to toggle the default microphone and camera, and how to toggle specific microphones and cameras.
