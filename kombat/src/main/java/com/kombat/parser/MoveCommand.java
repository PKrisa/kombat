package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;
import com.kombat.movement.*;
import com.kombat.player.Player;

public class MoveCommand implements Command{
    Direction direction;
    public MoveCommand(Direction direction) {
        this.direction = direction;
    }
    @Override
    public void execute(GameState gameState, Minion minion) {
        Position currentPosition = gameState.getPosition(minion);
        if (currentPosition == null) {
            throw new StrategyException("MoveCommand failed: Minion has no position.");
        }

        Position newPosition = currentPosition.move(direction);
        if (newPosition == null || !Position.isValidPosition(newPosition)) {
            throw new StrategyException("MoveCommand failed: Invalid move to "+ newPosition);
        }

        Minion occupiedMinion = gameState.getMinion(newPosition);
        if (occupiedMinion != null) {
            throw new StrategyException("MoveCommand failed: Position " + newPosition +
                    " is already occupied by " + occupiedMinion.getName());

        }

        Player owner = minion.getOwner();
        if (!owner.spendBudget(1)) {
            throw new StrategyException(minion.getName() + " tried to move but has insufficient budget.");

        }

        System.out.println(minion.getName() + " moves " + direction + " to " + newPosition);
        gameState.moveMinion(minion, direction);
    }
}
