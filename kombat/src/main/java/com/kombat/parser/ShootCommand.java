package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;
import com.kombat.movement.Direction;
import com.kombat.movement.Position;
import com.kombat.player.Player;

public class ShootCommand implements Command{
    private final Direction direction;
    private final Expression power;

    public ShootCommand(Direction direction, Expression power) {
        this.direction = direction;
        this.power = power;
    }

    @Override
    public void execute(GameState gameState, Minion minion) {
        if (!minion.isAlive()) return;
        Player player = minion.getOwner();
        Position minionPosition = gameState.getPosition(minion);
        if (minionPosition == null) {
            throw new StrategyException("ShootCommand failed: Minion has no position.");

        }

        Position targetPosition = minionPosition.move(direction);
        Minion target = (targetPosition != null && Position.isValidPosition(targetPosition))
                ? gameState.getMinion(targetPosition)
                : null;

        long damage = power.evaluate(gameState, minion);
        long totalCost = damage + 1;

        if (target != null) {
            if (!player.spendBudget(totalCost)) {
                throw new StrategyException(minion.getName() +
                        " tried to shoot but has insufficient budget.");

            }
            long reducedDamage = Math.max(1, damage - target.getDefense());
            target.takeDamage(gameState, reducedDamage);

            System.out.println(minion.getName() + " shoots " + direction + " at " +
                    target.getName() + " dealing " + reducedDamage + " damage!");

            minion.stopExecution();
            
            if (!target.isAlive()) {
                System.out.println(target.getName() + " has been eliminated!");
                gameState.removeMinion(target);
            }

            if (target.getOwner().equals(player)) {
                throw new StrategyException("WARNING: " + minion.getName() + " attacked an ally: " + target.getName());
            }

        } else {
            throw new StrategyException(minion.getName() + " shoots " + direction + " but hits nothing.");
        }
    }
}
