package com.kombat.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Scanner;
import java.util.Set;

import com.kombat.board.Board;
import com.kombat.config.Config;
import com.kombat.minion.Minion;
import com.kombat.minion.Miniontype;
import com.kombat.movement.Position;
import com.kombat.parser.Parser;
import com.kombat.parser.Strategy;
import com.kombat.player.Player;

public class Turn {
    private final GameState gameState;
    private final List<Player> players;
    private int turnNumber = 1;
    private final Long maxTurn;
    private Scanner scanner;
    private final Board board;
    private Map<String, Long> defenseMap;
    private Map<String, Strategy> strategyMap;
    private Map<String, String> minionNameMap;
    private String winner = "";
    private String winReason = "";
    private int currentPlayerIndex = 0;
    

    public Turn(GameState gameState, List<Player> players) {
        this.gameState = gameState;
        this.players = players;
        this.maxTurn = Config.max_turns;
        this.board = gameState.getBoard();
    }

    public void startGame(){
        scanner = new Scanner(System.in);
        List<String> selectedTypes = new ArrayList<>();
        this.defenseMap = new HashMap<>();
        this.strategyMap = new HashMap<>();
        this.minionNameMap = new HashMap<>();

        while (true) {
            System.out.println("Choose a minion type to use in this game (enter 'done' to finish):");
            System.out.println("(Available types: tank, archer, mage, knight, shooter)");
            String type = scanner.nextLine().trim().toLowerCase();

            if (type.equals("done")) break;

            if (!List.of("tank", "archer", "mage", "knight", "shooter").contains(type)) {
                System.out.println("Invalid type! Please enter a valid type.");
                continue;
            }

            if (selectedTypes.contains(type)) {
                System.out.println("You already selected this type!");
                continue;
            }

            selectedTypes.add(type);
        }

        for (String type : selectedTypes) {
            System.out.println("Enter minion's name for " + type + ":");
            String minionName = scanner.nextLine().trim().toLowerCase();
            minionNameMap.put(type, minionName);

            System.out.println("Enter defense value for " + type + ":");
            long defenseValue = scanner.nextInt();
            scanner.nextLine();
            defenseMap.put(type, defenseValue);

            System.out.println("Enter strategy for " + type + ":");
            StringBuilder strategyScript = new StringBuilder();
            while (true) {
                String line = scanner.nextLine().trim();
                if (line.isEmpty()) break;
                strategyScript.append(line).append("\n");
            }
            Strategy parsedStrategy = (Strategy) Parser.parse(strategyScript.toString());
            strategyMap.put(type, parsedStrategy);
        }
    }

    public void setMinionSetup(List<MinionSetup> setups) {
        this.defenseMap = new HashMap<>();
        this.strategyMap = new HashMap<>();
        this.minionNameMap = new HashMap<>();

        for (MinionSetup m : setups) {
            defenseMap.put(m.type, m.defense);

            Strategy parsed = (Strategy) Parser.parse(m.strategy);
            strategyMap.put(m.type, parsed);

            minionNameMap.put(m.type, m.name);
        }

        System.out.println("Minion setup loaded into Turn!");
    }

    public void playOneTurn() {

        if (isGameOver()) return;

        Player player = players.get(currentPlayerIndex);

        player.setPlacedFreeMinion(false);

        gameState.setCurrentPlayer(player);

        System.out.println("Turn " + turnNumber + " - " + player.getName());

        InterestCalculator.applyInterest(player, turnNumber);

        if (player.isBot()) {
            botPlayTurn(player);
        } else {
            List<Minion> minions = new ArrayList<>(player.getMinions());

            for (Minion m : minions) {
                m.resetExecution();
            }

            for (Minion minion : minions) {
                if (!minion.isAlive()) continue;

                if (minion.hasEndedTurn()) continue;

                minion.execute(gameState, minion);
            }
        }

        currentPlayerIndex++;

        if (currentPlayerIndex >= players.size()) {
            currentPlayerIndex = 0;
            turnNumber++;

            gameState.setCurrentTurn(turnNumber);
        }

        if (isGameOver()) {
            determineWinnerByStats();
        }
    }

    private void botPlayTurn(Player player) {
        System.out.println(player.getName() + " (BOT) turn:");

        //spawn cell
        if (Math.random() < 0.2) {
            Position posToBuy = findHexToBuy(player);
            if (posToBuy != null && player.getBudget() >= Config.hex_purchase_cost) {
                board.buySpawnZone(posToBuy, player);
            }
        }

        //free minion
        if (!player.hasPlacedFreeMinion()) {
            spawnRandomMinion(player, true);
        }

        //buy minion
        while (player.canSpawnMore() && Math.random() < 0.2 && player.getBudget() >= Config.spawn_cost) {
            spawnRandomMinion(player, false);
        }

        //Execute strategy
        List<Minion> minions = new ArrayList<>(player.getMinions());

        for (Minion m : minions) {
            m.resetExecution();
        }

        for (Minion minion : minions) {
            if (!minion.isAlive()) continue;

            if (minion.hasEndedTurn()) {
                continue;
            }

            System.out.println("EXECUTE: " + minion.getName());

            minion.execute(gameState, minion);

            if (!minion.isAlive()) continue;
        }
    }

    private void playerPlayTurn(Player player){
        System.out.println(player.getName() + "'s turn:");

        while (true) {
            System.out.println("Do you want to buy a spawn cell? (buy/done)");
            String input = scanner.nextLine().trim().toLowerCase();
            if (input.equals("done")) break;

            if (input.equals("buy")) {
                System.out.println("Enter row and col to buy (e.g., 3 2):");
                int row = scanner.nextInt();
                int col = scanner.nextInt();
                scanner.nextLine();
                Position pos = new Position(row-1, col-1);
                if (board.buySpawnZone(pos, player)) {
                    System.out.println("Spawn zone bought successfully.");
                    break;
                } else {
                    System.out.println("Failed to buy spawn zone.");
                }
            }
        }

        if (!player.hasPlacedFreeMinion()) {
            System.out.println("Placed free minion!");
            System.out.println("Enter minion type:");
            String type = scanner.nextLine().trim().toLowerCase();

            if (!defenseMap.containsKey(type) || !strategyMap.containsKey(type)) {
                System.out.println("ERROR: Minion type " + type + " is not configured.");
                return;
            }
            System.out.println("Enter row and col to place:");
            int row = scanner.nextInt();
            int col = scanner.nextInt();
            scanner.nextLine();
            Position pos = new Position(row-1, col-1);

            long minionDefense = defenseMap.get(type);
            Strategy minionStrategy = strategyMap.get(type);
            String minionName = minionNameMap.get(type);

            Minion minion = Miniontype.createMinion(type, minionName, minionDefense, minionStrategy, pos, player);
            if (gameState.placeMinion(minion, pos)) {
                player.addMinion(minion);
                System.out.println("Minion placed successfully: " + minion.getName());
            } else {
                System.out.println("Failed to place minion at " + pos);
            }
        }

        while (true) {
            System.out.println("Do you want to buy minions? (buy/done)");
            String input = scanner.nextLine().trim().toLowerCase();
            if (input.equals("done")) break;

            if (input.equals("buy")) {
                System.out.println("Enter minion type:");
                String type = scanner.nextLine().trim().toLowerCase();

                if (!defenseMap.containsKey(type) || !strategyMap.containsKey(type)) {
                    System.out.println("ERROR: Minion type " + type + " is not configured.");
                    return;
                }

                System.out.println("Enter row and col to place:");
                int row = scanner.nextInt();
                int col = scanner.nextInt();
                scanner.nextLine();
                Position pos = new Position(row-1, col-1);

                long minionDefense = defenseMap.get(type);
                Strategy minionStrategy = strategyMap.get(type);
                String minionName = minionNameMap.get(type);

                Minion minion = Miniontype.createMinion(type, minionName, minionDefense, minionStrategy, pos, player);

                if (gameState.placeMinion(minion, pos)) {
                    player.addMinion(minion);
                    System.out.println("Minion placed successfully: " + minion.getName());
                } else {
                    System.out.println("Failed to place minion at " + pos);
                }
                System.out.println("Player " + player.getName() + " now has " + player.getMinions().size() + " minions.");
            }
        }
        if (player.getMinions().isEmpty()) {
            declareWinner();
            return;
        }

        for (Minion m : player.getMinions()) {
            m.resetExecution();
        }

        for (Minion minion : player.getMinions()) {
            if (!minion.isAlive()) continue;
            
            if (minion.hasEndedTurn()) {
                System.out.println(minion.getName() + " skips this turn.");
                continue;
            }

            System.out.printf("%s (HP: %d, Position: %s, Budget: %d) is executing strategy...%n",
                    minion.getName(), minion.getHp(), gameState.getPosition(minion), player.getBudget());

            minion.execute(gameState, minion);
            System.out.println(minion.getName() + " finished executing.");
        }
    }

    private Position findAvailableSpawnPosition(Player player) {
        Set<Position> spawnZones = player.getPlayerId() == 1
            ? board.get_spawn_area_p1()
            : board.get_spawn_area_p2();

        for (Position pos : spawnZones) {
            if (board.getMinionAt(pos) == null) {
                return pos;
            }
        }
        return null;
    }

    private void spawnRandomMinion(Player player, boolean isFree) {
        List<String> availableTypes = new ArrayList<>(defenseMap.keySet());
        if (availableTypes.isEmpty()) {
            System.out.println("Bot has no minion types configured!");
            return;
        }

        String type = availableTypes.get(new Random().nextInt(availableTypes.size()));
        Position spawnPos = findAvailableSpawnPosition(player);

        if (spawnPos == null) {
            System.out.println("No available spawn position for " + player.getName());
            return;
        }

        long defense = defenseMap.get(type);
        Strategy strategy = strategyMap.get(type);
        String minionName = minionNameMap.get(type);

        Minion minion = Miniontype.createMinion(type, minionName, defense, strategy, spawnPos, player);

        if (isFree) {
            if (gameState.placeMinion(minion, spawnPos)) {
                player.addMinion(minion);
                System.out.println(player.getName() + " (Bot) placed a free minion: " + minion.getName());
            }
        } else {
            if (player.getBudget() >= Config.spawn_cost && gameState.placeMinion(minion, spawnPos)) {
                player.spendBudget(Config.spawn_cost);
                player.addMinion(minion);
                System.out.println(player.getName() + " (Bot) placed minion: " + minion.getName());
            }
        }
    }

    private Position findHexToBuy(Player player) {
        Set<Position> playerZones = player.getPlayerId() == 1
            ? board.get_spawn_area_p1()
            : board.get_spawn_area_p2();

        //find hex spawn zone
        for (Position zone : playerZones) {
            for (Position adj : zone.adjacentPositions()) {
                if (Position.isValidPosition(adj) && !playerZones.contains(adj)) {
                    return adj;
                }
            }
        }
        return null;
    }

    public boolean isGameOver() {
        boolean defeated = turnNumber > 1 && players.stream().anyMatch(Player::isDefeated);
        boolean spawnLimitReached = players.stream().allMatch(player ->
                player.getSpawnCount() >= player.getMaxSpawn());
        boolean maxTurnReached = turnNumber > maxTurn;

        System.out.println("Checking game over: Defeated=" + defeated + ", SpawnLimitReached=" + spawnLimitReached +
                ", MaxTurnReached=" + maxTurnReached);

        return defeated || spawnLimitReached || maxTurnReached;
    }

    public void declareWinner() {
        Player p1 = players.get(0);
        Player p2 = players.get(1);

        if (p1.isDefeated()) {
            winner = p2.getName();
            winReason = "Opponent has no minions left";
        } else if (p2.isDefeated()) {
            winner = p1.getName();
            winReason = "Opponent has no minions left";
        }
    }

    private void determineWinnerByStats() {
        Player p1 = players.get(0);
        Player p2 = players.get(1);

        long p1MinionCount = p1.getMinions().size();
        long p2MinionCount = p2.getMinions().size();

        if (p1MinionCount > p2MinionCount) {
            winner = p1.getName();
            winReason = "More minions remaining";
            return;
        } else if (p2MinionCount > p1MinionCount) {
            winner = p2.getName();
            winReason = "More minions remaining";
            return;
        }

        long p1TotalHP = p1.getMinions().stream().mapToLong(Minion::getHp).sum();
        long p2TotalHP = p2.getMinions().stream().mapToLong(Minion::getHp).sum();

        if (p1TotalHP > p2TotalHP) {
            winner = p1.getName();
            winReason = "Higher total HP";
            return;
        } else if (p2TotalHP > p1TotalHP) {
            winner = p2.getName();
            winReason = "Higher total HP";
            return;
        }

        if (p1.getBudget() > p2.getBudget()) {
            winner = p1.getName();
            winReason = "More budget remaining";
        } else if (p2.getBudget() > p1.getBudget()) {
            winner = p2.getName();
            winReason = "More budget remaining";
        } else {
            winner = "Draw";
            winReason = "Equal in all stats";
        }
    }

    public String getWinner() {
        return winner;
    }

    public String getWinReason(){
        return winReason;
    }

    public int getCurrentPlayerId() {
        return players.get(currentPlayerIndex).getPlayerId();
    }

    public long getDefense(String type) {
        return defenseMap.get(type);
    }

    public Strategy getStrategy(String type) {
        return strategyMap.get(type);
    }

    public String getMinionName(String type) {
        return minionNameMap.get(type);
    }
}
