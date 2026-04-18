package com.kombat.minion;

import com.kombat.movement.Position;
import com.kombat.parser.Strategy;
import com.kombat.player.Player;

public class Miniontype {
    public static Minion createMinion(String type, String name, long defense, Strategy strategy,
                                      Position position, Player player) {
        return switch (type.toLowerCase()) {
            case "tank" -> new TankMinion(name, type, defense, strategy, position, player);
            case "archer" -> new ArcherMinion(name, type, defense, strategy, position, player);
            case "mage" -> new MageMinion(name, type, defense, strategy, position, player);
            case "knight" -> new KnightMinion(name, type, defense, strategy, position, player);
            case "shooter" -> new ShooterMinion(name, type, defense, strategy, position, player);
            default -> throw new IllegalArgumentException("Unknown minion type: " + type);
        };
    }
}
