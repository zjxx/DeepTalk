package com.example.deeptalk.modules.speech.entity;

import lombok.Getter;
import lombok.Setter;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;
import org.springframework.web.socket.WebSocketSession;

@Getter
@Setter
public class KurentoUserSession {
    private MediaPipeline mediaPipeline;
    private WebRtcEndpoint webRtcEndpoint;
    private String sessionId;
    private String userId;
    private WebSocketSession webSocketSession;
    private boolean connected;

    public KurentoUserSession(String userId, String sessionId) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.connected = false;
    }

    public void releaseWebRtcEndpoint() {
        if (webRtcEndpoint != null) {
            webRtcEndpoint.release();
            webRtcEndpoint = null;
        }
    }
}
