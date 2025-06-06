/*
 * Copyright 2018 Kurento (https://www.kurento.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const CONNECT_API = "http://localhost:8080/api/speech/connect";
const DISCONNECT_API = "http://localhost:8080/api/speech/disconnect";

function randomString(number) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < number; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

let userId = randomString(10);
let sessionId = "";

async function connectBackend() {
  console.log("Connecting to the server...");
  await fetch(CONNECT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      sessionId: "", // This will be empty for the first connection
    }),
  }).then(response => {
    return response.text();
  }).then(textData => {
    sessionId = textData;
    console.log("Session ID: {}", sessionId);
  });
}

async function disconnectBackend() {
  console.log("Disconnecting from the server...");
  await fetch(DISCONNECT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      sessionId: sessionId.toString(), // This will be used to identify the session
    }),
  }).then(response => {
    console.log(response);
    return response.text();
  }).then(textData => {
    console.log(textData);
  });
}

// -------------------------------------


ws = new WebSocket('ws://localhost:8080/api/speech/kurento');

let webRtcPeer;

// UI
let uiLocalVideo;
let uiRemoteVideo;
let uiState = null;
const UI_IDLE = 0;
const UI_STARTING = 1;
const UI_STARTED = 2;

window.onload = function () {
  console = new Console();
  console.log("Page loaded");
  uiLocalVideo = document.getElementById('uiLocalVideo');
  uiRemoteVideo = document.getElementById('uiRemoteVideo');
  uiSetState(UI_IDLE);
}

window.onbeforeunload = function () {
  console.log("Page unload - Close WebSocket");
  ws.close();
}

function explainUserMediaError(err) {
  const n = err.name;
  if (n === 'NotFoundError' || n === 'DevicesNotFoundError') {
    return "Missing webcam for required tracks";
  }
  else if (n === 'NotReadableError' || n === 'TrackStartError') {
    return "Webcam is already in use";
  }
  else if (n === 'OverconstrainedError' || n === 'ConstraintNotSatisfiedError') {
    return "Webcam doesn't provide required tracks";
  }
  else if (n === 'NotAllowedError' || n === 'PermissionDeniedError') {
    return "Webcam permission has been denied by the user";
  }
  else if (n === 'TypeError') {
    return "No media tracks have been requested";
  }
  else {
    return "Unknown error: " + err;
  }
}

function sendError(message) {
  console.error(message);

  sendMessage({
    id: 'ERROR',
    message: message,
  });
}

function sendMessage(message) {
  if (ws.readyState !== ws.OPEN) {
    console.warn("[sendMessage] Skip, WebSocket session isn't open");
    return;
  }

  const jsonMessage = JSON.stringify(message);
  console.log("[sendMessage] message: " + jsonMessage);
  ws.send(jsonMessage);
}



/* ============================= */
/* ==== WebSocket signaling ==== */
/* ============================= */


ws.onopen = function () {
  console.log("[WebSocket] Connection Established!");
}

ws.onmessage = function (message) {
  const jsonMessage = JSON.parse(message.data);
  console.log("[onmessage] Received message: " + message.data);

  switch (jsonMessage.id) {
    case 'PROCESS_SDP_ANSWER':
      handleProcessSdpAnswer(jsonMessage);
      break;
    case 'ADD_ICE_CANDIDATE':
      handleAddIceCandidate(jsonMessage);
      break;
    case 'ERROR':
      handleError(jsonMessage);
      break;
    default:
      // Ignore the message
      console.warn("[onmessage] Invalid message, id: " + jsonMessage.id);
      break;
  }
}

// PROCESS_SDP_ANSWER ----------------------------------------------------------

function handleProcessSdpAnswer(jsonMessage) {
  console.log("[handleProcessSdpAnswer] SDP Answer from Kurento, process in WebRTC Peer");

  if (webRtcPeer == null) {
    console.warn("[handleProcessSdpAnswer] Skip, no WebRTC Peer");
    return;
  }

  webRtcPeer.processAnswer(jsonMessage.sdpAnswer, (err) => {
    if (err) {
      sendError("[handleProcessSdpAnswer] Error: " + err);
      stop();
      return;
    }

    console.log("[handleProcessSdpAnswer] SDP Answer ready; start remote video");
    startVideo(uiRemoteVideo);

    uiSetState(UI_STARTED);
  });
}

// ADD_ICE_CANDIDATE -----------------------------------------------------------

function handleAddIceCandidate(jsonMessage) {
  if (webRtcPeer == null) {
    console.warn("[handleAddIceCandidate] Skip, no WebRTC Peer");
    return;
  }

  webRtcPeer.addIceCandidate(jsonMessage.candidate, (err) => {
    if (err) {
      console.error("[handleAddIceCandidate] " + err);
      return;
    }
  });
}

// STOP ------------------------------------------------------------------------

function stop() {
  if (uiState == UI_IDLE) {
    console.log("[stop] Skip, already stopped");
    return;
  }

  console.log("[stop]");

  if (webRtcPeer) {
    webRtcPeer.dispose();
    webRtcPeer = null;
  }

  uiSetState(UI_IDLE);
  hideSpinner(uiLocalVideo, uiRemoteVideo);

  sendMessage({
    id: 'STOP',
    sessionId: sessionId.toString(),
  });
}

// ERROR -----------------------------------------------------------------------

function handleError(jsonMessage) {
  const errMessage = jsonMessage.message;
  console.error("Kurento error: " + errMessage);

  console.log("Assume that the other side stops after an error...");
  stop();
}



/* ==================== */
/* ==== UI actions ==== */
/* ==================== */

// Start -----------------------------------------------------------------------
async function uiStart() {
  await connectBackend();


  console.log("[start] Create WebRtcPeerSendrecv");
  uiSetState(UI_STARTING);

  const options = {
    localVideo: uiLocalVideo,
    remoteVideo: uiRemoteVideo,
    mediaConstraints: { audio: true, video: true },
    onicecandidate: (candidate) => sendMessage({
      id: 'ADD_ICE_CANDIDATE',
      candidate: candidate,
      sessionId: sessionId.toString(),
    }),
  };

  webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
    function (err) {
      if (err) {
        sendError("[start/WebRtcPeerSendrecv] Error: "
          + explainUserMediaError(err));
        stop();
        return;
      }

      console.log("[start/WebRtcPeerSendrecv] Created; start local video");
      startVideo(uiLocalVideo);

      console.log("[start/WebRtcPeerSendrecv] Generate SDP Offer");
      webRtcPeer.generateOffer((err, sdpOffer) => {
        if (err) {
          sendError("[start/WebRtcPeerSendrecv/generateOffer] Error: " + err);
          stop();
          return;
        }

        sendMessage({
          id: 'PROCESS_SDP_OFFER',
          sdpOffer: sdpOffer,
          userId: userId.toString(),
        });

        console.log("[start/WebRtcPeerSendrecv/generateOffer] Done!");
        uiSetState(UI_STARTED);
      });
    });
}

// Stop ------------------------------------------------------------------------

async function uiStop() {
  await disconnectBackend();
  stop();
}

// -----------------------------------------------------------------------------


/* ================== */
/* ==== UI state ==== */
/* ================== */

function uiSetState(newState) {
  switch (newState) {
    // case UI_IDLE:
    //   uiEnableElement('#uiStartBtn', 'uiStart()');
    //   uiDisableElement('#uiStopBtn');
    //   break;
    // case UI_STARTING:
    //   uiDisableElement('#uiStartBtn');
    //   uiDisableElement('#uiStopBtn');
    //   break;
    // case UI_STARTED:
    //   uiDisableElement('#uiStartBtn');
    //   uiEnableElement('#uiStopBtn', 'uiStop()');
    //   break;
    // default:
    //   console.warn("[setState] Skip, invalid state: " + newState);
    //   return;
    default:
      uiEnableElement('#uiStartBtn', 'uiStart()');
      uiEnableElement('#uiStopBtn', 'uiStop()');
  }
  uiState = newState;
}

function uiEnableElement(id, onclickHandler) {
  $(id).attr('disabled', false);
  if (onclickHandler) {
    $(id).attr('onclick', onclickHandler);
  }
}

function uiDisableElement(id) {
  $(id).attr('disabled', true);
  $(id).removeAttr('onclick');
}

function showSpinner() {
  for (let i = 0; i < arguments.length; i++) {
    arguments[i].poster = './img/transparent-1px.png';
    arguments[i].style.background = "center transparent url('./img/spinner.gif') no-repeat";
  }
}

function hideSpinner() {
  for (let i = 0; i < arguments.length; i++) {
    arguments[i].src = '';
    arguments[i].poster = './img/webrtc.png';
    arguments[i].style.background = '';
  }
}

function startVideo(video) {
  // Manually start the <video> HTML element
  // This is used instead of the 'autoplay' attribute, because iOS Safari
  // requires a direct user interaction in order to play a video with audio.
  // Ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
  video.play().catch((err) => {
    if (err.name === 'NotAllowedError') {
      console.error("[start] Browser doesn't allow playing video: " + err);
    }
    else {
      console.error("[start] Error in video.play(): " + err);
    }
  });
}

/**
 * Lightbox utility (to display media pipeline image in a modal dialog)
 */
$(document).delegate('*[data-toggle="lightbox"]', 'click', function (event) {
  event.preventDefault();
  $(this).ekkoLightbox();
});
