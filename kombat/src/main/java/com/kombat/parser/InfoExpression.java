package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;
import com.kombat.movement.Direction;

public class InfoExpression implements Expression{
    private final String info;
    private final Direction direction;
    public InfoExpression(String info) {
        this.info = info;
        this.direction = null;
    }
    public InfoExpression(String info, Direction direction) {
        this.info = info;
        this.direction = direction;
    }

    @Override
    public long evaluate(GameState gameState, Minion minion) {
        return switch (info) {
            case "ally" -> GameStateEvaluator.getInstance().allyMinion(gameState,minion);
            case "opponent" -> GameStateEvaluator.getInstance().opponentMinion(gameState, minion);
            case "nearby" -> {
                if (direction == null) throw new RuntimeException("Nearby needs a direction");
                yield GameStateEvaluator.getInstance().nearbyMinions(gameState, minion, direction);
            }
            default -> throw new RuntimeException("Unknown info type: " + info);
        };
    }
}
