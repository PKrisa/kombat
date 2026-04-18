package com.kombat.game;

import java.util.HashMap;
import java.util.List;
import java.util.Scanner;

import com.kombat.board.Board;
import com.kombat.config.Config;
import com.kombat.player.Player;

public class Main {
    public static void main(String[] args) {
        Config config = new Config();

        Scanner scanner = new Scanner(System.in);
        Board board = new Board();
        GameState gameState = new GameState(board, new HashMap<>());

        System.out.println("Select game mode:");
        System.out.println("1. Duel (Player vs Player)");
        System.out.println("2. Solitaire (Player vs Bot)");
        System.out.println("3. Auto (Bot vs Bot)");
        int mode = scanner.nextInt();
        scanner.nextLine();

        //Mode.selectMode(mode);
        
        Player player1 = Mode.getPlayer1();
        Player player2 = Mode.getPlayer2();

        gameState.addPlayer(player1);
        gameState.addPlayer(player2);

        Turn turn = new Turn(gameState, List.of(player1, player2));
        turn.startGame();
        turn.playOneTurn();
    }
}