package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public interface Expression {
    long evaluate(GameState gameState, Minion minion);
}
