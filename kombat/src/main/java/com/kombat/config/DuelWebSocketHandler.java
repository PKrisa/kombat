package com.kombat.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kombat.board.Board;
import com.kombat.game.GameSession;
import com.kombat.game.GameState;
import com.kombat.game.Mode;
import com.kombat.game.Turn;
import com.kombat.minion.Minion;
import com.kombat.minion.Miniontype;
import com.kombat.movement.Position;
import com.kombat.parser.Parser;
import com.kombat.parser.Strategy;
import com.kombat.player.Player;

public class DuelWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        Map<String, Object> data = mapper.readValue(message.getPayload(), Map.class);
        String type = (String) data.get("type");

        switch (type) {

            case "CREATE_ROOM" -> {
                Room room = RoomManager.createRoom(session);
                sendRoomUpdate(room);
            }

            case "JOIN_ROOM" -> {
                String roomId = (String) data.get("roomId");
                Room room = RoomManager.getRoom(roomId);

                if (room != null && room.guest == null) {
                    room.guest = session;
                    room.guestJoined = true;
                    sendRoomUpdate(room);
                }
            }

            case "READY" -> {
                Room room = RoomManager.findBySession(session);
                if (room != null) {
                    room.guestLobbyReady = true;
                    sendRoomUpdate(room);
                }
            }

            case "START" -> {
                Room room = RoomManager.findBySession(session);

                if (room.guestJoined && room.guestLobbyReady) {
                    sendToBoth(room, Map.of("type", "START_GAME"));
                }
            }

            // ในกรณี SELECT_MINIONS
            case "SELECT_MINIONS" -> {
                Room room = RoomManager.findBySession(session);

                if (room != null) {
                    List<String> types = (List<String>) data.get("types");

                    if (session == room.host) {
                        room.hostMinions = types;
                    } else {
                        room.guestMinions = types;
                    }

                    // แก้ไขตรงนี้: ป้องกันค่า null
                    Map<String, Object> updateData = new HashMap<>();
                    updateData.put("type", "MINION_UPDATE");
                    updateData.put("hostMinions", room.hostMinions != null ? room.hostMinions : List.of());
                    updateData.put("guestMinions", room.guestMinions != null ? room.guestMinions : List.of());
                    updateData.put("hostReady", room.hostMinionReady);
                    updateData.put("guestReady", room.guestMinionReady);

                    sendToBoth(room, updateData);

                    //System.out.println("HOST = " + room.hostMinions);
                    //System.out.println("GUEST = " + room.guestMinions);
                }
            }

            // ในกรณี READY_MINIONS 
            case "READY_MINIONS" -> {
                Room room = RoomManager.findBySession(session);
                if (room != null) {
                    // 1. บันทึกสถานะว่าใครกด Ready
                    if (session == room.host) {
                        room.hostMinionReady = true;
                    } else {
                        room.guestMinionReady = true;
                    }

                    // 2. ส่งสถานะ Update กลับไป (เพื่อให้ UI ฝั่ง Client ขึ้น ✅)
                    Map<String, Object> updateData = new HashMap<>();
                    updateData.put("type", "MINION_UPDATE");
                    updateData.put("hostMinions", room.hostMinions != null ? room.hostMinions : List.of());
                    updateData.put("guestMinions", room.guestMinions != null ? room.guestMinions : List.of());
                    updateData.put("hostReady", room.hostMinionReady);
                    updateData.put("guestReady", room.guestMinionReady);
                    sendToBoth(room, updateData);

                    // 3. เช็คว่าพร้อมทั้งสองคนหรือยัง?
                    if (room.hostMinionReady && room.guestMinionReady) {

                        List<String> host = room.hostMinions;
                        List<String> guest = room.guestMinions;

                        if (host.equals(guest)) {
                            room.finalMinions = host;
                        } else {
                            boolean pickHost = new java.util.Random().nextBoolean();
                            room.finalMinions = pickHost ? host : guest;
                        }

                        sendToBoth(room, Map.of(
                            "type", "BOTH_READY",
                            "finalMinions", room.finalMinions
                        ));
                    }
                }
            }
            
            case "SUBMIT_STRATEGY" -> {
                Room room = RoomManager.findBySession(session);
                room.setupData = (List<Map<String,Object>>) data.get("data");
                if (room != null) {
                    // ดึงข้อมูลที่ส่งมาจาก Player 1
                    Object strategyData = data.get("data");
                    Map names = (Map)data.get("names");

                    String n1 = (String) names.get("name1");
                    String n2 = (String) names.get("name2");

                    if (n1 != null && !n1.isBlank()) room.hostName = n1;
                    if (n2 != null && !n2.isBlank()) room.guestName = n2;
                    System.out.println("HOST=" + room.hostName);
                    System.out.println("GUEST=" + room.guestName);

                    // ส่งต่อไปให้ทั้งสองฝั่ง (เพื่อให้ Player 2 รับรู้)
                    sendToBoth(room, Map.of(
                        "type", "STRATEGY_SUBMITTED",
                        "data", strategyData,
                        "names", names
                    ));
                }
            }

            case "RESPONSE_STRATEGY" -> {
                Room room = RoomManager.findBySession(session);
                if (room != null) {
                    String action = (String) data.get("action");
                    sendToBoth(room, Map.of(
                        "type", "STRATEGY_RESPONSE",
                        "action", action
                    ));

                    if ("ACCEPT".equals(action)) {


                        GameSession.setMode(1);
                        Mode.selectMode(1, room.hostName, room.guestName);

                        Player p1 = Mode.getPlayer1();
                        Player p2 = Mode.getPlayer2();

                        Board board = new Board();
                        GameState gs = new GameState(board, new HashMap<>());

                        gs.addPlayer(p1);
                        gs.addPlayer(p2);

                        gs.setCurrentPlayer(p1);
                        gs.setCurrentTurn(1);

                        Turn turn = new Turn(gs, List.of(p1, p2));

                        GameSession.setGame(gs, turn, List.of(p1, p2));

                        sendToBoth(room, Map.of(
                            "type", "GAME_STARTED"
                        ));

                        sendGameState(room);
                    }
                }
            }

            case "TRANSFER_EDITOR" -> {
                Room room = RoomManager.findBySession(session);
                if (room != null) {
                    String newEditor = (String) data.get("newEditor");
                    sendToBoth(room, Map.of(
                        "type", "EDITOR_TRANSFERRED",
                        "newEditor", newEditor
                    ));
                }
            }

            case "END_TURN" -> {

                Room room = RoomManager.findBySession(session);
                Turn turn = GameSession.getTurn();
                GameState gs = GameSession.getGameState();

                if (turn == null || gs == null) return;

                int current = turn.getCurrentPlayerId();

                boolean allowed =
                    (current == 1 && session == room.host) ||
                    (current == 2 && session == room.guest);

                if (!allowed) return;

                turn.playOneTurn();

                int next = turn.getCurrentPlayerId();

                gs.setCurrentPlayer(gs.getPlayers().get(next));

                sendGameState(room);
            }

            case "SPAWN" -> {

                Room room = RoomManager.findBySession(session);
                GameState gs = GameSession.getGameState();

                int row = (Integer)data.get("row");
                int col = (Integer)data.get("col");
                String minionType  = (String)data.get("minionType");

                Player current = gs.getCurrentPlayer();

                Map<String,Object> config = room.setupData.stream()
                    .filter(x -> x.get("type").equals(minionType))
                    .findFirst()
                    .orElse(null);

                if(config == null) return;

                String name = (String) config.get("name");
                long defense = Long.parseLong(config.get("defense").toString());
                String strategyText = (String) config.get("strategy");

                Strategy strategy = (Strategy) Parser.parse(strategyText);

                Minion minion = Miniontype.createMinion(
                    minionType,
                    name,
                    defense,
                    strategy,
                    new Position(row,col),
                    current
                );

                boolean ok = gs.placeMinion(minion, new Position(row,col));

                if (ok) {
                    current.addMinion(minion);
                    sendGameState(room);
                }

            }

            case "UPDATE_NAME" -> {
                Room room = RoomManager.findBySession(session);
                if (room != null) {
                    String n1 = (String) data.get("name1");
                    String n2 = (String) data.get("name2");
                    if (n1 != null && !n1.isBlank()) room.hostName = n1;
                    if (n2 != null && !n2.isBlank()) room.guestName = n2;
                    // broadcast ให้อีกฝั่งเห็นชื่อด้วย
                    sendToBoth(room, Map.of(
                        "type", "UPDATE_NAME",
                        "name1", room.hostName != null ? room.hostName : "",
                        "name2", room.guestName != null ? room.guestName : ""
                    ));
                }
            }
            
        }
    }

    private void sendRoomUpdate(Room room) throws Exception {
        sendToBoth(room, Map.of(
                "type", "ROOM_UPDATE",
                "room", Map.of(
                        "roomId", room.roomId,
                        "host", room.host != null,
                        "guest", room.guestJoined,
                        "guestReady", room.guestLobbyReady
                )
        ));
    }

    private void sendToBoth(Room room, Object data) throws Exception {
        String json = mapper.writeValueAsString(data);

        if (room.host != null && room.host.isOpen()) {
            room.host.sendMessage(new TextMessage(json));
        }
        if (room.guest != null && room.guest.isOpen()) {
            room.guest.sendMessage(new TextMessage(json));
        }
    }

    private void sendGameState(Room room) throws Exception {

        GameState gs = GameSession.getGameState();
        Turn turn = GameSession.getTurn();

        if (gs == null || turn == null) return;

        Board board = gs.getBoard();

        boolean isGameOver = turn.isGameOver();

        // ---------------- PLAYERS ----------------
        List<Map<String, Object>> players = gs.getPlayers().values().stream()
            .map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getPlayerId());
                map.put("name", p.getName());
                map.put("budget", p.getBudget());
                map.put("minionCount", p.getMinions().size());
                return map;
            })
            .toList();

        // ---------------- MINIONS ----------------
        List<Map<String, Object>> minions = gs.getPlayers().values().stream()
            .flatMap(p -> p.getMinions().stream())
            .map(m -> {
                Position pos = gs.getPosition(m);

                Map<String, Object> map = new HashMap<>();
                map.put("name", m.getName());
                map.put("type", m.getType());
                map.put("hp", m.getHp());
                map.put("owner", m.getOwner().getPlayerId());
                map.put("row", pos != null ? pos.getRow() : -1);
                map.put("col", pos != null ? pos.getCol() : -1);

                return map;
            })
            .toList();

        // ---------------- SPAWN ZONES ----------------
        List<Map<String, Object>> spawns = new ArrayList<>();

        for (Position pos : board.get_spawn_area_p1()) {
            Map<String, Object> map = new HashMap<>();
            map.put("row", pos.getRow());
            map.put("col", pos.getCol());
            map.put("owner", 1);
            spawns.add(map);
        }

        for (Position pos : board.get_spawn_area_p2()) {
            Map<String, Object> map = new HashMap<>();
            map.put("row", pos.getRow());
            map.put("col", pos.getCol());
            map.put("owner", 2);
            spawns.add(map);
        }

        // ---------------- BUYABLE ----------------
        Player p1 = gs.getPlayers().get(1);
        Player p2 = gs.getPlayers().get(2);

        // ---------------- RESPONSE ----------------
        Map<String, Object> data = new HashMap<>();

        data.put("type", "GAME_STATE");

        data.put("turn", gs.getCurrentTurn());
        data.put("currentPlayer", gs.getCurrentPlayer().getPlayerId());

        data.put("players", players);
        data.put("minions", minions);
        data.put("spawns", spawns);

        data.put("buyableP1", board.getPurchasableHexes(p1));
        data.put("buyableP2", board.getPurchasableHexes(p2));

        data.put("isGameOver", isGameOver);
        data.put("winner", isGameOver ? turn.getWinner() : "");
        data.put("winReason", isGameOver ? turn.getWinReason() : "");

        data.put("logs", gs.getLogs());
        gs.clearLogs();

        sendToBoth(room, data);
    }
}
