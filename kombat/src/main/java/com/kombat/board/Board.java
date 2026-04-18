package com.kombat.board;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.kombat.config.Config;
import com.kombat.minion.Minion;
import com.kombat.movement.Position;
import com.kombat.player.Player;

public class Board {
    private final Map<Position, Minion> board;
    private final Set<Position> spawn_area_p1;
    private final Set<Position> spawn_area_p2;
    private final long hexPurchaseCost;

    public Board() {
        this.board = new HashMap<>();
        this.hexPurchaseCost = Config.hex_purchase_cost;

        spawn_area_p1 = new HashSet<>();
        spawn_area_p1.add(new Position(0,0));
        spawn_area_p1.add(new Position(0,1));
        spawn_area_p1.add(new Position(1,0));
        spawn_area_p1.add(new Position(1,1));
        spawn_area_p1.add(new Position(0,2));

        spawn_area_p2 = new HashSet<>();
        spawn_area_p2.add(new Position(7,5));
        spawn_area_p2.add(new Position(7,6));
        spawn_area_p2.add(new Position(7,7));
        spawn_area_p2.add(new Position(6,6));
        spawn_area_p2.add(new Position(6,7));
    }

    public Set<Position> get_spawn_area_p1() {
        return spawn_area_p1;
    }

    public Set<Position> get_spawn_area_p2() {
        return spawn_area_p2;
    }

    public boolean placeMinion(Minion minion, Position position, Player player) {
        if (!isSpawnZone(position, player)) {
            System.out.println("Not in spawn zone");
            return false;
        }

        if (board.containsKey(position)) {
            System.out.println("Position occupied");
            return false;
        }

        board.put(position, minion);
        minion.setPosition(position);

        System.out.println(
            "[PLACE] " + minion.getName() +
            " by " + player.getName() +
            " at (" + position.getRow() + "," + position.getCol() + ")"
        );

        return true;
    }

    public Position getPosition(Minion minion) {
        for (Map.Entry<Position, Minion> entry : board.entrySet()) {
            if (entry.getValue().equals(minion)) {
                return entry.getKey();
            }
        }
        return null;
    }

    public Minion getMinionAt(Position position) {
        return board.get(position);
    }

    public void moveMinion(Minion minion, Position newPosition) {
        if (!board.containsValue(minion)) {
            System.out.println("Not found minion on board");
            return;
        }

        if (!Position.isValidPosition(newPosition)) {
            System.out.println("Out of bounds");
            return;
        }

        Position oldPosition = getPosition(minion);

        if (oldPosition == null) {
            System.out.println("Minion has no position");
            return;
        }

        if (board.containsKey(newPosition)) {
            System.out.println("Position occupied");
            return;
        }

        board.remove(oldPosition);
        board.put(newPosition, minion);
        minion.setPosition(newPosition);
    }

    public void removeMinion(Minion minion) {
        Position position = getPosition(minion);
        if (position != null) {
            board.remove(position);
        }
    }

    public boolean isSpawnZone(Position position, Player player) {
        if (player.getPlayerId() == 1) {
            return spawn_area_p1.contains(position);
        } else if (player.getPlayerId() == 2) {
            return spawn_area_p2.contains(position);
        }
        return false;
    }

    public boolean buySpawnZone(Position newPosition, Player player) {
        Set<Position> playerSpawnZone = player.getPlayerId() == 1
                ? spawn_area_p1
                : spawn_area_p2;

        Set<Position> opponentZone = player.getPlayerId() == 1
                ? spawn_area_p2
                : spawn_area_p1;

        if (playerSpawnZone.contains(newPosition)) {
            System.out.println("Already owned");
            return false;
        }

        if (opponentZone.contains(newPosition)) {
            System.out.println("Cannot buy opponent zone!");
            return false;
        }

        if (isAdjacentToSpawnZone(newPosition, playerSpawnZone)) {
            if (player.spendBudget(hexPurchaseCost)) {
                playerSpawnZone.add(newPosition);
                return true;
            }
        }
        

        return false;
    }

    private boolean isAdjacentToSpawnZone(Position position, Set<Position> spawnZone) {
        for (Position p : spawnZone) {
            if (p.isAdjacent(position)) {
                return true;
            }
        }
        return false;
    }

    public Set<Position> getPurchasableHexes(Player player) {
        Set<Position> playerSpawnZone = player.getPlayerId() == 1
                ? spawn_area_p1
                : spawn_area_p2;

        Set<Position> result = new HashSet<>();

        for (Position p : playerSpawnZone) {
            for (Position adj : p.adjacentPositions()) {
                if (Position.isValidPosition(adj)
                        && !playerSpawnZone.contains(adj)) {
                    result.add(adj);
                }
            }
        }

        return result;
    }

    public boolean canPlaceMinion(Position pos, Player player) {
        return isSpawnZone(pos, player) && !board.containsKey(pos);
    }

    public Map<Position, Minion> getBoardMap() {
        return board;
    }
}