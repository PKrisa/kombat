package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public interface Strategy {
    void execute(GameState gameState, Minion minion);
    static Strategy fromStatement(Statement statement) {
        return statement::execute;
    }
}
