package com.kombat.parser;

import java.util.List;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public class BlockStatement implements Statement,Strategy {
    private final List<Statement> statements;

    public BlockStatement(List<Statement> statements) {
        this.statements = statements;
    }

    @Override
    public void execute(GameState gameState, Minion minion) {
        for (Statement stmt : statements) {
            stmt.execute(gameState, minion);
        }
    }
}
