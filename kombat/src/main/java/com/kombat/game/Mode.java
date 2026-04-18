package com.kombat.game;

import com.kombat.player.Player;

public class Mode {
    private static Player player1;
    private static Player player2;
    
    public static void selectMode(int mode,String name1,String name2){

        switch (mode) {
            case 1 -> {
                // Duel
                player1 = new Player(name1, 1, false);
                player2 = new Player(name2, 2, false);
                player1.setPlacedFreeMinion(false);
                player2.setPlacedFreeMinion(false);
            }
            case 2 -> {
                // Solitaire
                player1 = new Player(name1, 1, false);
                player2 = new Player("Bot", 2,true);
            }
            default -> {
                // Auto
                player1 = new Player("Bot1", 1,true);
                player2 = new Player("Bot2", 2,true);
            }
        }
    }

    public static Player getPlayer1() {
        return player1;
    }

    public static Player getPlayer2() {
        return player2;
    }
}
