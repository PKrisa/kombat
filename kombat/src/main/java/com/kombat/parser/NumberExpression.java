package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public class NumberExpression implements Expression{
    private final long value;
    public NumberExpression(long value) {
        this.value = value;
    }

    @Override
    public long evaluate(GameState gameState, Minion minion) {
        return value;
    }
}
