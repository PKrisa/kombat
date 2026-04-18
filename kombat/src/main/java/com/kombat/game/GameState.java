package com.kombat.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.kombat.board.Board;
import com.kombat.config.Config;
import com.kombat.minion.Minion;
import com.kombat.movement.Direction;
import com.kombat.movement.Position;
import com.kombat.player.Player;

public class GameState {
    private final Board board;
    private final Map<Integer, Player> players;
    private final long spawnCost;
    private int currentTurn = 1;
    private String gameMode;
    private Player currentPlayer;


    public GameState(Board board, Map<Integer, Player> players) {
        this.board = board;
        this.players = players;
        this.spawnCost = Config.spawn_cost;
    }

    public boolean placeMinion(Minion minion, Position position) {
        Player player = minion.getOwner();

        if (board.getMinionAt(position) != null) {
            System.out.println("Cannot place " + minion.getName() + " at " + position + ". Already occupied!");
            return false;
        }

        if (!board.isSpawnZone(position, player)) {
            System.out.println("Cannot place minion outside spawn zone!");
            return false;
        }

        if (!player.hasPlacedFreeMinion()) {
            player.setPlacedFreeMinion(true);
            board.placeMinion(minion, position,player);
            System.out.println(player.getName() + " placed a free minion: " + minion.getName());
            return true;
        }

        if (!player.spendBudget(spawnCost)) {
            System.out.println(player.getName() + " cannot afford to place " + minion.getName());
            return false;
        }

        board.placeMinion(minion, position,player);
        System.out.println(player.getName() + " placed minion: " + minion.getName() + " (Cost: " + spawnCost+ ")");
        return true;

    }

    public void removeMinion(Minion minion) {
        board.removeMinion(minion);
    }

    public void moveMinion(Minion minion, Direction direction) {
        Position currentPosition = board.getPosition(minion);
        if (currentPosition == null) return;

        Position newPosition = currentPosition.move(direction);
        if (!Position.isValidPosition(newPosition)) return;

        board.moveMinion(minion, newPosition);

    }

    public Position getPosition(Minion minion) {
        return board.getPosition(minion);
    }

    public Minion getMinion(Position position) {
        return board.getMinionAt(position);
    }

    public Board getBoard() {
        return board;
    }

    public void addPlayer(Player player) {
        players.put(player.getPlayerId(), player);
    }

    public Player getPlayer(int playerId) {
        return players.get(playerId);
    }

    public Map<Integer, Player> getPlayers() {
        return players;
    }

    /*public List<MinionConfig> getMinionSetups() {
        return this.minionConfigs;
    }

    public void setMinionSetups(List<MinionConfig> setups) {
        this.minionConfigs = setups;
    }*/

    public int getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(int turnNumber) {
        this.currentTurn = turnNumber;
    }

    public String getGameMode() {
        return gameMode;
    }

    public void setGameMode(String gameMode) {
        this.gameMode = gameMode;
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(Player player) {
        this.currentPlayer = player;
    }

    private List<String> logs = new ArrayList<>();

    public void addLog(String log) {
        logs.add(log);
    }

    public List<String> getLogs() {
        return logs;
    }

    public void clearLogs() {
        logs.clear();
    }
}
