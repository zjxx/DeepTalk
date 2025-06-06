package com.example.deeptalk.modules.speech.service;

import com.example.deeptalk.modules.speech.entity.KurentoSpeechSession;
import com.example.deeptalk.modules.speech.entity.KurentoUserSession;
import com.example.deeptalk.modules.speech.entity.SpeechSessionInfo;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.*;
import org.kurento.jsonrpc.JsonUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.google.gson.JsonObject;
import org.springframework.web.socket.handler.TextWebSocketHandler;


/*
* Ws packet:
* {
*  "userId": String,
*  "sessionId": String,
*  "payload": ...
* }
* connect -> INIT_WEBSOCKET/SDP_ -> ... -> disconnect
* */

@Slf4j
@Component
public class KurentoHandler extends TextWebSocketHandler {
    private static final Gson gson = new GsonBuilder().create();

//    @Autowired
    private final KurentoClient kurento = KurentoClient.create();

    private final ConcurrentHashMap<String, KurentoUserSession> connectedUsers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, KurentoSpeechSession> speechSessions = new ConcurrentHashMap<>();

// -------- Kurento Handler Methods --------

    public SpeechSessionInfo createSession(String user1Id, String user2Id) {

        String sessionId = UUID.randomUUID().toString();


        // Create user sessions
        KurentoUserSession user1 = new KurentoUserSession(user1Id, sessionId);
        KurentoUserSession user2 = new KurentoUserSession(user2Id, sessionId);

        // Create media pipeline
        MediaPipeline pipeline = kurento.createMediaPipeline();
        user1.setMediaPipeline(pipeline);
        user2.setMediaPipeline(pipeline);

        // Create WebRtcEndpoints for both users
        WebRtcEndpoint webRtcEp1 =
                new WebRtcEndpoint.Builder(pipeline).build();
        WebRtcEndpoint webRtcEp2 =
                new WebRtcEndpoint.Builder(pipeline).build();
        user1.setWebRtcEndpoint(webRtcEp1);
        user2.setWebRtcEndpoint(webRtcEp2);

        KurentoSpeechSession speechSession = new KurentoSpeechSession(sessionId, user1, user2);
        speechSessions.put(sessionId, speechSession);
        connectedUsers.put(user1Id, user1);
        connectedUsers.put(user2Id, user2);

        log.info("[KurentoHandler::newSpeechSession] sessionId: {}, user1: {}, user2: {}",
                sessionId, user1Id, user2Id);

        return new SpeechSessionInfo(sessionId, user1Id, user2Id);
    }

    public void terminateSession(String sessionId) {
        KurentoSpeechSession session = speechSessions.remove(sessionId);
        if (session != null) {
            log.info("[KurentoHandler::terminateSession] Terminating session: {}", sessionId);
            // Release WebRtcEndpoints
            session.releaseWebRtcEndpoints();

            // Remove user sessions
            KurentoUserSession user1 = session.getUser1();
            KurentoUserSession user2 = session.getUser2();
            connectedUsers.remove(user1.getUserId());
            connectedUsers.remove(user2.getUserId());

            // Release media pipeline
            MediaPipeline mediaPipeline = user1.getMediaPipeline();
            if (mediaPipeline != null) {
                mediaPipeline.release();
                log.info("[KurentoHandler::terminateSession] Media pipeline released for session: {}", sessionId);
            }
        } else {
            log.warn("[KurentoHandler::terminateSession] No active session found for sessionId: {}", sessionId);
        }
    }

    private KurentoSpeechSession getSpeechSession(String sessionId) {
        return speechSessions.get(sessionId);
    }

    private synchronized void sendMessage(final WebSocketSession session, String message)
    {
        log.debug("[HelloWorldHandler::sendMessage] {}", message);

        if (!session.isOpen()) {
            log.warn("[HelloWorldHandler::sendMessage] Skip, WebSocket session isn't open");
            return;
        }

        final String sessionId = session.getId();

        try {
            session.sendMessage(new TextMessage(message));
        } catch (IOException ex) {
            log.error("[HelloWorldHandler::sendMessage] Exception: {}", ex.getMessage());
        }
    }

    private void sendError(final WebSocketSession session, String errMsg)
    {
        log.error(errMsg);
        // TODO: Send the error message to the client
    }

    private synchronized void handleInitWebSocket(final WebSocketSession session, JsonObject Message)
    {
        log.info("[KurentoHandler::handleInitWebSocket] {}", Message);
        String userId = Message.get("userId").getAsString();
        // Check if the user exists
        KurentoUserSession user = connectedUsers.get(userId);
        if (user == null) {
            log.warn("[KurentoHandler::handleInitWebSocket] Skip, user session not found, id: {}", userId);
            return;
        }
        // Associate the WebSocket session with the user session
        user.setWebSocketSession(session);

        WebRtcEndpoint webRtcEp = user.getWebRtcEndpoint();
        // ---- Endpoint configuration

        String sdpOffer = Message.get("sdpOffer").getAsString();
        initWebRtcEndpoint(session, webRtcEp, sdpOffer);

        user.setConnected(true);

        log.info("[KurentoHandler::handleInitWebSocket] New WebRtcEndpoint: {}",
                webRtcEp.getName());

        KurentoUserSession opponentUser = speechSessions.get(user.getSessionId()).getOpponentUser(userId);
        if (user.isConnected() && opponentUser.isConnected()) {
            log.info("[KurentoHandler::handleInitWebSocket] Both users are connected, linking session: {}", user.getSessionId());
            WebRtcEndpoint opponentWebRtcEp = opponentUser.getWebRtcEndpoint();
            // Link the WebRtcEndpoints of both users
            webRtcEp.connect(opponentWebRtcEp);
            opponentWebRtcEp.connect(webRtcEp);
            log.info("[KurentoHandler::handleInitWebSocket] Starting session: {}",
                    user.getSessionId());
            // Start the WebRtcEndpoint for both users
            startWebRtcEndpoint(webRtcEp);
            startWebRtcEndpoint(opponentWebRtcEp);
        } else {
            log.warn("[KurentoHandler::handleInitWebSocket] One or both users are not connected, session: {}",
                    user.getSessionId());
        }
    }

// -------- Kurento WebSocket Handler Methods from demo --------

    /**
     * Invoked after WebSocket negotiation has succeeded and the WebSocket connection is
     * opened and ready for use.
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session)
            throws Exception
    {
        log.info("[HelloWorldHandler::afterConnectionEstablished] New WebSocket connection, sessionId: {}",
                session.getId());
    }

    /**
     * Invoked after the WebSocket connection has been closed by either side, or after a
     * transport error has occurred. Although the session may technically still be open,
     * depending on the underlying implementation, sending messages at this point is
     * discouraged and most likely will not succeed.
     */
    @Override
    public void afterConnectionClosed(final WebSocketSession session,
                                      CloseStatus status) throws Exception
    {
        if (!status.equalsCode(CloseStatus.NORMAL)) {
            log.warn("[HelloWorldHandler::afterConnectionClosed] status: {}, sessionId: {}",
                    status, session.getId());
        }
    }

    /**
     * Invoked when a new WebSocket message arrives.
     */
    @Override
    protected void handleTextMessage(WebSocketSession session,
                                     TextMessage message) throws Exception
    {
        final String sessionId = session.getId();
        JsonObject jsonMessage = gson.fromJson(message.getPayload(),
                JsonObject.class);

        log.info("[KurentoHandler::handleTextMessage] message: {}, sessionId: {}",
                jsonMessage, sessionId);

        try {
            final String messageId = jsonMessage.get("id").getAsString();
            switch (messageId) {
//                case "PROCESS_SDP_OFFER":
//                    // Start: Create user session and process SDP Offer
//                    handleProcessSdpOffer(session, jsonMessage);
//                    break;
                // Enhancement: You can map the userId to the actual websocket session
                //  for better security
                case "PROCESS_SDP_OFFER":
                    handleInitWebSocket(session, jsonMessage);
                    break;
                case "INIT_WEBSOCKET":
                    handleInitWebSocket(session, jsonMessage);
                    break;
                case "ADD_ICE_CANDIDATE":
                    handleAddIceCandidate(session, jsonMessage);
                    break;
//                case "STOP":
//                    handleStop(session, jsonMessage);
//                    break;
                case "ERROR":
                    handleError(session, jsonMessage);
                    break;
                default:
                    // Ignore the message
                    log.warn("[KurentoHandler::handleTextMessage] Skip, invalid message, id: {}",
                            messageId);
                    break;
            }
        } catch (Throwable ex) {
            log.error("[KurentoHandler::handleTextMessage] Exception: {}, sessionId: {}",
                    ex, sessionId);
            sendError(session, "[Kurento] Exception: " + ex.getMessage());
        }
    }

    /**
     * Handle an error from the underlying WebSocket message transport.
     */
    @Override
    public void handleTransportError(WebSocketSession session,
                                     Throwable exception) throws Exception
    {
        log.error("[KurentoHandler::handleTransportError] Exception: {}, sessionId: {}",
                exception, session.getId());

        session.close(CloseStatus.SERVER_ERROR);
    }

    // PROCESS_SDP_OFFER ---------------------------------------------------------

    private void initBaseEventListeners(final WebSocketSession session,
                                        BaseRtpEndpoint baseRtpEp, final String className)
    {
        log.info("[KurentoHandler::initBaseEventListeners] name: {}, class: {}, sessionId: {}",
                baseRtpEp.getName(), className, session.getId());

        // Event: Some error happened
        baseRtpEp.addErrorListener(new EventListener<ErrorEvent>() {
            @Override
            public void onEvent(ErrorEvent ev) {
                log.error("[{}::ErrorEvent] Error code {}: '{}', source: {}, timestamp: {}, tags: {}, description: {}",
                        className, ev.getErrorCode(), ev.getType(), ev.getSource().getName(),
                        ev.getTimestampMillis(), ev.getTags(), ev.getDescription());

                sendError(session, "[Kurento] " + ev.getDescription());
                stop(session);
            }
        });

        // Event: Media is flowing into this sink
        baseRtpEp.addMediaFlowInStateChangedListener(
                new EventListener<MediaFlowInStateChangedEvent>() {
                    @Override
                    public void onEvent(MediaFlowInStateChangedEvent ev) {
                        log.info("[{}::{}] source: {}, timestamp: {}, tags: {}, state: {}, padName: {}, mediaType: {}",
                                className, ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), ev.getState(), ev.getPadName(), ev.getMediaType());
                    }
                });

        // Event: Media is flowing out of this source
        baseRtpEp.addMediaFlowOutStateChangedListener(
                new EventListener<MediaFlowOutStateChangedEvent>() {
                    @Override
                    public void onEvent(MediaFlowOutStateChangedEvent ev) {
                        log.info("[{}::{}] source: {}, timestamp: {}, tags: {}, state: {}, padName: {}, mediaType: {}",
                                className, ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), ev.getState(), ev.getPadName(), ev.getMediaType());
                    }
                });

        // Event: [TODO write meaning of this event]
        baseRtpEp.addConnectionStateChangedListener(
                new EventListener<ConnectionStateChangedEvent>() {
                    @Override
                    public void onEvent(ConnectionStateChangedEvent ev) {
                        log.info("[{}::{}] source: {}, timestamp: {}, tags: {}, oldState: {}, newState: {}",
                                className, ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), ev.getOldState(), ev.getNewState());
                    }
                });

        // Event: [TODO write meaning of this event]
        baseRtpEp.addMediaStateChangedListener(
                new EventListener<MediaStateChangedEvent>() {
                    @Override
                    public void onEvent(MediaStateChangedEvent ev) {
                        log.info("[{}::{}] source: {}, timestamp: {}, tags: {}, oldState: {}, newState: {}",
                                className, ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), ev.getOldState(), ev.getNewState());
                    }
                });

        // Event: This element will (or will not) perform media transcoding
        baseRtpEp.addMediaTranscodingStateChangedListener(
                new EventListener<MediaTranscodingStateChangedEvent>() {
                    @Override
                    public void onEvent(MediaTranscodingStateChangedEvent ev) {
                        log.info("[{}::{}] source: {}, timestamp: {}, tags: {}, state: {}, binName: {}, mediaType: {}",
                                className, ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), ev.getState(), ev.getBinName(), ev.getMediaType());
                    }
                });
    }

    private void initWebRtcEventListeners(final WebSocketSession session,
                                          final WebRtcEndpoint webRtcEp)
    {
        log.info("[HelloWorldHandler::initWebRtcEventListeners] name: {}, sessionId: {}",
                webRtcEp.getName(), session.getId());

        // Event: The ICE backend found a local candidate during Trickle ICE
        webRtcEp.addIceCandidateFoundListener(
                new EventListener<IceCandidateFoundEvent>() {
                    @Override
                    public void onEvent(IceCandidateFoundEvent ev) {
                        log.debug("[WebRtcEndpoint::{}] source: {}, timestamp: {}, tags: {}, candidate: {}",
                                ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), JsonUtils.toJson(ev.getCandidate()));

                        JsonObject message = new JsonObject();
                        message.addProperty("id", "ADD_ICE_CANDIDATE");
                        message.add("candidate", JsonUtils.toJsonObject(ev.getCandidate()));
                        sendMessage(session, message.toString());
                    }
                });

        // Event: The ICE backend changed state
        webRtcEp.addIceComponentStateChangedListener(
                new EventListener<IceComponentStateChangedEvent>() {
                    @Override
                    public void onEvent(IceComponentStateChangedEvent ev) {
                        log.debug("[WebRtcEndpoint::{}] source: {}, timestamp: {}, tags: {}, streamId: {}, componentId: {}, state: {}",
                                ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), ev.getStreamId(), ev.getComponentId(), ev.getState());
                    }
                });

        // Event: The ICE backend finished gathering ICE candidates
        webRtcEp.addIceGatheringDoneListener(
                new EventListener<IceGatheringDoneEvent>() {
                    @Override
                    public void onEvent(IceGatheringDoneEvent ev) {
                        log.info("[WebRtcEndpoint::{}] source: {}, timestamp: {}, tags: {}",
                                ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags());
                    }
                });

        // Event: The ICE backend selected a new pair of ICE candidates for use
        webRtcEp.addNewCandidatePairSelectedListener(
                new EventListener<NewCandidatePairSelectedEvent>() {
                    @Override
                    public void onEvent(NewCandidatePairSelectedEvent ev) {
                        log.info("[WebRtcEndpoint::{}] name: {}, timestamp: {}, tags: {}, streamId: {}, local: {}, remote: {}",
                                ev.getType(), ev.getSource().getName(), ev.getTimestampMillis(),
                                ev.getTags(), ev.getCandidatePair().getStreamId(),
                                ev.getCandidatePair().getLocalCandidate(),
                                ev.getCandidatePair().getRemoteCandidate());
                    }
                });
    }

    private void initWebRtcEndpoint(final WebSocketSession session,
                                    final WebRtcEndpoint webRtcEp, String sdpOffer)
    {
        initBaseEventListeners(session, webRtcEp, "WebRtcEndpoint");
        initWebRtcEventListeners(session, webRtcEp);

        final String sessionId = session.getId();
        final String name = "user" + sessionId + "_webrtcendpoint";
        webRtcEp.setName(name);

        // Continue the SDP Negotiation: Generate an SDP Answer
        final String sdpAnswer = webRtcEp.processOffer(sdpOffer);

        log.info("[HelloWorldHandler::initWebRtcEndpoint] name: {}, SDP Offer from browser to KMS:\n{}",
                name, sdpOffer);
        log.info("[HelloWorldHandler::initWebRtcEndpoint] name: {}, SDP Answer from KMS to browser:\n{}",
                name, sdpAnswer);

        JsonObject message = new JsonObject();
        message.addProperty("id", "PROCESS_SDP_ANSWER");
        message.addProperty("sdpAnswer", sdpAnswer);
        sendMessage(session, message.toString());
    }

    private void startWebRtcEndpoint(WebRtcEndpoint webRtcEp)
    {
        // Calling gatherCandidates() is when the Endpoint actually starts working.
        // In this tutorial, this is emphasized for demonstration purposes by
        // launching the ICE candidate gathering in its own method.
        webRtcEp.gatherCandidates();
    }

//    private void handleProcessSdpOffer(final WebSocketSession session,
//                                       JsonObject jsonMessage)
//    {
//        // ---- Session handling
//
//        final String sessionId = session.getId();
//
//        log.info("[HelloWorldHandler::handleStart] User count: {}", users.size());
//        log.info("[HelloWorldHandler::handleStart] New user, id: {}", sessionId);
//
//        final KurentoUserSession user = new KurentoUserSession();
//        users.put(sessionId, user);
//
//
//        // ---- Media pipeline
//
//        log.info("[HelloWorldHandler::handleStart] Create Media Pipeline");
//
//        final MediaPipeline pipeline = kurento.createMediaPipeline();
//        user.setMediaPipeline(pipeline);
//
//        final WebRtcEndpoint webRtcEp =
//                new WebRtcEndpoint.Builder(pipeline).build();
//        user.setWebRtcEndpoint(webRtcEp);
//        webRtcEp.connect(webRtcEp);
//
//
//        // ---- Debug
//        // final String pipelineDot = pipeline.getGstreamerDot();
//        // try (PrintWriter out = new PrintWriter("pipeline.dot")) {
//        //   out.println(pipelineDot);
//        // } catch (IOException ex) {
//        //   log.error("[HelloWorldHandler::start] Exception: {}", ex.getMessage());
//        // }
//    }

    // ADD_ICE_CANDIDATE ---------------------------------------------------------

    private void handleAddIceCandidate(final WebSocketSession session,
                                       JsonObject jsonMessage)
    {
        final String sessionId = session.getId();
        if (!connectedUsers.containsKey(sessionId)) {
            log.warn("[HelloWorldHandler::handleAddIceCandidate] Skip, unknown user, id: {}",
                    sessionId);
            return;
        }

        final KurentoUserSession user = connectedUsers.get(sessionId);
        final JsonObject jsonCandidate =
                jsonMessage.get("candidate").getAsJsonObject();
        final IceCandidate candidate =
                new IceCandidate(jsonCandidate.get("candidate").getAsString(),
                        jsonCandidate.get("sdpMid").getAsString(),
                        jsonCandidate.get("sdpMLineIndex").getAsInt());

        WebRtcEndpoint webRtcEp = user.getWebRtcEndpoint();
        webRtcEp.addIceCandidate(candidate);
    }

    // STOP ----------------------------------------------------------------------

    private void stop(final WebSocketSession session)
    {
        // Remove the user session and release all resources
        final KurentoUserSession user = connectedUsers.remove(session.getId());
        if (user != null) {
            MediaPipeline mediaPipeline = user.getMediaPipeline();
            if (mediaPipeline != null) {
                log.info("[HelloWorldHandler::stop] Release the Media Pipeline");
                mediaPipeline.release();
            }
        }
    }

//    private void handleStop(final WebSocketSession session,
//                            JsonObject jsonMessage)
//    {
//        stop(session);
//    }

    // ERROR ---------------------------------------------------------------------

    private void handleError(final WebSocketSession session,
                             JsonObject jsonMessage)
    {
        final String errMsg = jsonMessage.get("message").getAsString();
        log.error("Browser error: " + errMsg);

        log.info("Assume that the other side stops after an error...");
        stop(session);
    }
}
