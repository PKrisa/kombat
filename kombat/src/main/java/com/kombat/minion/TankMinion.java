package com.kombat.minion;

import com.kombat.movement.Position;
import com.kombat.parser.Strategy;
import com.kombat.player.Player;

public class TankMinion extends Minion {
    public TankMinion(String name, String type, long defense, Strategy strategy, Position position, Player player){
        super(name,type,defense,strategy,position,player);
    }
}
