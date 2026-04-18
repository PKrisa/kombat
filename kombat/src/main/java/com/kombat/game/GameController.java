package com.kombat.game;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kombat.board.Board;
import com.kombat.minion.Minion;
import com.kombat.minion.Miniontype;
import com.kombat.movement.Position;
import com.kombat.parser.Parser;
import com.kombat.parser.Strategy;
import com.kombat.player.Player;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/game")
public class GameController {

    @PostMapping("/mode")
    public Map<String, Object> setMode(@RequestBody Map<String, Object> body) {

        int mode = (int) body.get("mode");
        String name1 = (String) body.getOrDefault("name1", "Player1");
        String name2 = (String) body.getOrDefault("name2", "Player2");

        GameSession.setMode(mode);
        Mode.selectMode(mode, name1, name2);

        return Map.of(
            "message", "Mode set successfully",
            "mode", GameSession.getModeName()
        );
    }

    @GetMapping("/mode")
    public Map<String, Object> getMode() {
        return Map.of(
            "mode", GameSession.getMode(),
            "modeName", GameSession.getModeName()
        );
    }

    private static List<String> selectedTypes;

    @SuppressWarnings("unchecked")
    @PostMapping("/minions")
    public Map<String, Object> setMinions(@RequestBody Map<String, Object> body) {
        selectedTypes = (List<String>) body.get("types");

        return Map.of(
            "selectedTypes", selectedTypes,
            "count", selectedTypes.size()
        );
    }

    @GetMapping("/minions")
    public Map<String, Object> getMinions() {
        return Map.of(
            "selectedTypes", selectedTypes,
            "count", selectedTypes == null ? 0 : selectedTypes.size()
        );
    }

    @PostMapping("/parse")
    public Map<String, Object> parseStrategy(@RequestBody Map<String, String> body) {
        String strategy = body.get("strategy");

        try {
            Parser.parse(strategy); 

            return Map.of(
                "valid", true,
                "message", "Strategy valid"
            );

        } catch (Exception e) {
            return Map.of(
                "valid", false,
                "message", e.getMessage()
            );
        }
    }

    private static List<MinionSetup> minionSetups;

    @PostMapping("/setup")
    public Map<String, Object> setMinionSetup(@RequestBody List<MinionSetup> setups) {
        minionSetups = setups;

        for (MinionSetup m : setups) {
            System.out.println("Name: " + m.name);
            System.out.println("Type: " + m.type);
            System.out.println("Defense: " + m.defense);
            System.out.println("Strategy: " + m.strategy);
            System.out.println("------");
        }

        return Map.of(
            "message", "Setup saved",
            "count", setups.size()
        );
    }

    @GetMapping("/setup")
    public List<MinionSetup> getSetup() {
        return minionSetups;
    }

    @PostMapping("/start")
    public Map<String, Object> startGame(@RequestBody Map<String, Object> body) {
        int mode = (int) body.get("mode");
        String name1 = (String) body.get("name1");
        String name2 = (String) body.get("name2");

        // set mode
        GameSession.setMode(mode);
        Mode.selectMode(mode,name1,name2);

        // create players
        Player player1 = Mode.getPlayer1();
        Player player2 = Mode.getPlayer2();

        // create game state
        Board board = new Board();
        GameState gameState = new GameState(board, new java.util.HashMap<>());

        gameState.addPlayer(player1);
        gameState.addPlayer(player2);

        gameState.setCurrentPlayer(player1);

        // create turn system
        Turn turn = new Turn(gameState, List.of(player1, player2));

        if (minionSetups != null) {
            turn.setMinionSetup(minionSetups);
        }

        gameState.setCurrentTurn(1);

        // save to session
        GameSession.setGame(gameState, turn, List.of(player1, player2));

        return Map.of(
            "message", "Game started",
            "mode", GameSession.getModeName()
        );
    }

    @GetMapping("/state")
    public Map<String, Object> getGameState() {
        GameState gs = GameSession.getGameState();
        Board board = gs.getBoard();
        Turn turn = GameSession.getTurn();

        boolean isGameOver = turn != null && turn.isGameOver();

        // players
        List<Map<String, Object>> players = gs.getPlayers().values().stream()
            .map(p -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", p.getPlayerId());
                map.put("name", p.getName());
                map.put("budget", p.getBudget());
                map.put("minionCount", p.getMinions().size());
                return map;
            })
            .collect(java.util.stream.Collectors.toList());

        // minions
        List<Map<String, Object>> minions = gs.getPlayers().values().stream()
            .flatMap(p -> p.getMinions().stream())
            .map(m -> {
                com.kombat.movement.Position pos = gs.getPosition(m);

                Map<String, Object> map = new java.util.HashMap<>();
                map.put("name", m.getName());
                map.put("type", m.getType());
                map.put("hp", m.getHp());
                map.put("owner", m.getOwner().getPlayerId());
                map.put("row", pos != null ? pos.getRow() : -1);
                map.put("col", pos != null ? pos.getCol() : -1);

                return map;
            })
            .collect(java.util.stream.Collectors.toList());

        List<Map<String, Object>> spawns = new java.util.ArrayList<>();

        for (var pos : board.get_spawn_area_p1()) {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("row", pos.getRow());
            m.put("col", pos.getCol());
            m.put("owner", 1);
            spawns.add(m);
        }

        for (var pos : board.get_spawn_area_p2()) {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("row", pos.getRow());
            m.put("col", pos.getCol());
            m.put("owner", 2);
            spawns.add(m);
        }

            Player p1 = gs.getPlayers().get(1);
            Player p2 = gs.getPlayers().get(2);

        Map<String, Object> res = new HashMap<>();

        res.put("turn", gs.getCurrentTurn());
        res.put("currentPlayer", gs.getCurrentPlayer().getPlayerId());
        res.put("mode", GameSession.getModeName());
        res.put("isGameOver", isGameOver);
        res.put("players", players);
        res.put("minions", minions);
        res.put("spawns", spawns);
        res.put("buyableP1", board.getPurchasableHexes(p1));
        res.put("buyableP2", board.getPurchasableHexes(p2));
        res.put("winner", isGameOver && turn != null ? turn.getWinner() : "");
        res.put("winReason", isGameOver && turn != null ? turn.getWinReason() : "");
        res.put("logs", gs.getLogs());
        gs.clearLogs();

        return res;
    }

    @PostMapping("/turn")
    public Map<String, Object> nextTurn() {
        Turn turn = GameSession.getTurn();
        if (turn == null) return Map.of("error", "Game not started");
        
        try {
            turn.playOneTurn();
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
        
        return Map.of("message", "Turn executed",
                    "turn", GameSession.getGameState().getCurrentTurn());
    }

    @PostMapping("/buy")
    public Map<String, Object> buySpawn(@RequestBody Map<String, Integer> body) {
        int row = body.get("row");
        int col = body.get("col");

        GameState gs = GameSession.getGameState();
        Player currentPlayer = gs.getCurrentPlayer(); // ต้องมี method นี้นะ

        boolean success = gs.getBoard().buySpawnZone(
            new com.kombat.movement.Position(row, col),
            currentPlayer
        );

        return Map.of(
            "success", success
        );
    }

    @PostMapping("/spawn")
    public Map<String, Object> spawn(@RequestBody Map<String, Object> body) {
        int row = (int) body.get("row");
        int col = (int) body.get("col");
        String type = (String) body.get("type");

        GameState gs = GameSession.getGameState();
        Player player = gs.getCurrentPlayer();

        Turn turn = GameSession.getTurn();

        Position pos = new Position(row, col);

        long defense = turn.getDefense(type);
        Strategy strategy = turn.getStrategy(type);
        String name = turn.getMinionName(type);

        Minion minion = Miniontype.createMinion(
            type, name, defense, strategy, pos, player
        );

        boolean success = gs.placeMinion(minion, pos);

        if (success) {
            player.addMinion(minion);
        }

        return Map.of("success", success);
    }
}
