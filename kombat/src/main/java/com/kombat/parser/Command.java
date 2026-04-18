package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public interface Command extends Statement{
    @Override
    void execute(GameState gameState, Minion minion);
}
