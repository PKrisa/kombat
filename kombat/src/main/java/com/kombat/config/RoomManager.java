package com.kombat.config;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.web.socket.WebSocketSession;

public class RoomManager {
    public static Map<String, Room> rooms = new HashMap<>();

    public static Room createRoom(WebSocketSession host) {
        String id = String.valueOf(new Random().nextInt(900000) + 100000);

        Room r = new Room();
        r.roomId = id;
        r.host = host;

        rooms.put(id, r);
        return r;
    }

    public static Room getRoom(String id) {
        return rooms.get(id);
    }

    public static Room findBySession(WebSocketSession session) {
        return rooms.values().stream()
                .filter(r -> r.host == session || r.guest == session)
                .findFirst().orElse(null);
    }
}
