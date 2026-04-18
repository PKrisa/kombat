package com.kombat.config;

import java.util.List;
import java.util.Map;

import org.springframework.web.socket.WebSocketSession;

public class Room {
    public String roomId;
    public WebSocketSession host;
    public WebSocketSession guest;
    public List<String> hostMinions;
    public List<String> guestMinions;
    public List<String> finalMinions;
    public boolean hostReady = false;
    public boolean guestReady = false;
    public boolean guestJoined = false;
    public boolean guestLobbyReady = false;
    public boolean hostMinionReady = false;
    public boolean guestMinionReady = false;
    public String hostName;
    public String guestName;
    public List<Map<String,Object>> setupData;
}
