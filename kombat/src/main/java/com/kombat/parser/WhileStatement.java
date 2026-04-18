package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public class WhileStatement implements Statement{
    private static final int MAX_LOOP = 10_000;
    Expression condition;
    BlockStatement body;
    public WhileStatement(Expression condition, BlockStatement body) {
        this.condition = condition;
        this.body = body;
    }

    @Override
    public void execute(GameState gameState, Minion minion) {
        int iteration = 0;

        while (condition.evaluate(gameState, minion) > 0) {
            if (minion.hasEndedTurn()) break;
            
            if (iteration >= MAX_LOOP) {
                minion.stopExecution();
                break;
            }
            body.execute(gameState, minion);
            iteration++;
        }
    }
}
