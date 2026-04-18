package com.kombat.parser;

import java.util.HashMap;
import java.util.Map;

import com.kombat.board.Board;
import com.kombat.game.GameState;
import com.kombat.minion.Minion;
import com.kombat.movement.Direction;
import com.kombat.movement.Position;

public class GameStateEvaluator {
    private final Map<String, Long> variables = new HashMap<>();
    private static final GameStateEvaluator instance = new GameStateEvaluator();

    private GameStateEvaluator() {
    }

    public static GameStateEvaluator getInstance() {
        return instance;
    }

    public int opponentMinion(GameState gameState, Minion minion) {
        return entityMinions(gameState, minion, false);
    }

    public int allyMinion(GameState gameState, Minion minion) {
        return entityMinions(gameState, minion, true);
    }

    public int entityMinions(GameState gameState, Minion minion, boolean isAlly) {
        Board board = gameState.getBoard();
        Position position = board.getPosition(minion);
        if (position == null) {
            throw new RuntimeException("Error: Minion has no assigned position.");
        }

        int minDistance = Integer.MAX_VALUE;
        int bestDirection = 0;

        for (int i = 0; i < Direction.values().length; i++) {
            Direction directionEnum = Direction.values()[i];
            Position currentPosition = position.move(directionEnum);
            int distance = 1;

            while (currentPosition != null && Position.isValidPosition(currentPosition)) {
                Minion foundMinion = board.getMinionAt(currentPosition);

                if (foundMinion != null) {
                    boolean isSameOwner = foundMinion.getOwner().equals(minion.getOwner());

                    if ((isAlly && isSameOwner) || (!isAlly && !isSameOwner)) {
                        if (distance < minDistance || (distance == minDistance && i + 1 < bestDirection)) {
                            minDistance = distance;
                            bestDirection = i + 1;
                        }
                        break;
                    }
                }

                currentPosition = currentPosition.move(directionEnum);
                distance++;
            }
        }

        return (minDistance == Integer.MAX_VALUE) ? 0 : (minDistance * 10 + bestDirection);
    }

    public int nearbyMinions(GameState gameState, Minion minion, Direction direction) {
        Board board = gameState.getBoard();
        Position position = board.getPosition(minion);
        if (position == null) return 0;

        Position nextPosition = position.move(direction);
        int distance = 1;

        while (nextPosition != null && Position.isValidPosition(nextPosition)) {
            Minion foundMinion = board.getMinionAt(nextPosition);
            if (foundMinion != null) {
                boolean isSameOwner = foundMinion.getOwner().equals(minion.getOwner());
                int x = String.valueOf(foundMinion.getHp()).length();
                int y = String.valueOf(foundMinion.getDefense()).length();
                int result = 100 * x + 10 * y + distance;

                return isSameOwner ? -result : result;
            }
            nextPosition = nextPosition.move(direction);
            distance++;
        }
        return 0;
    }

    public void setVariable(String varName, long value) {
        variables.put(varName, value);
    }

    public long getVariable(String varName) {
        return variables.getOrDefault(varName, (long) 0);
    }
}
