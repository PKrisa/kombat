package com.kombat.game;

import java.util.List;

import com.kombat.player.Player;

public class GameSession {
    private static int currentMode;

    private static GameState gameState;
    private static Turn turn;
    private static List<Player> players;

    public static void setMode(int mode) {
        currentMode = mode;
    }

    public static int getMode() {
        return currentMode;
    }

    public static String getModeName() {
        return switch (currentMode) {
            case 1 -> "Duel";
            case 2 -> "Solitaire";
            case 3 -> "Auto";
            default -> "Unknown";
        };
    }

    // 🔥 เพิ่มตรงนี้
    public static void setGame(GameState gs, Turn t, List<Player> ps) {
        gameState = gs;
        turn = t;
        players = ps;
    }

    public static GameState getGameState() {
        return gameState;
    }

    public static Turn getTurn() {
        return turn;
    }

    public static List<Player> getPlayers() {
        return players;
    }

    public static void reset() {
        gameState = null;
        turn = null;
        players = null;
    }
}