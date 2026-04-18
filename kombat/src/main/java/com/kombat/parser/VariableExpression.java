package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public class VariableExpression implements Expression {
    private final String varName;
    public VariableExpression(String varName) {
        this.varName = varName;
    }
    
    @Override
    public long evaluate(GameState gameState, Minion minion) {
        return GameStateEvaluator.getInstance().getVariable(varName);
    }
}
