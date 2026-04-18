package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public class DoneCommand implements Command{
    @Override
    public void execute(GameState gameState, Minion minion) {
        System.out.println(minion.getName() + " ends its turn.");
        minion.stopExecution();
    }
}
