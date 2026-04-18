package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public interface Statement {
    void execute(GameState gameState, Minion minion);
}
