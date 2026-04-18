package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public class AssignmentStatement implements Statement{
    String varName;
    Expression value;
    public AssignmentStatement(String varName, Expression value) {
        this.varName = varName;
        this.value = value;
    }

    @Override
    public void execute(GameState gameState, Minion minion) {
        if (varName == null || varName.isEmpty()) {
            throw new StrategyException("Assignment error: Variable name is null or empty.");
        }

        long evaluatedValue;
        try {
            evaluatedValue = value.evaluate(gameState, minion);
        } catch (Exception e) {
            throw new StrategyException("Error evaluating expression for " + varName + ": " + e.getMessage());
        }

        GameStateEvaluator.getInstance().setVariable(varName, evaluatedValue);
        //System.out.println("Assigned " + varName + " = " + evaluatedValue);
    }
}
