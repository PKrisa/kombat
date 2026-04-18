package com.kombat.minion;

import com.kombat.config.Config;
import com.kombat.game.GameState;
import com.kombat.movement.Position;
import com.kombat.parser.Strategy;
import com.kombat.parser.StrategyException;
import com.kombat.player.Player;

public abstract class Minion {
    private final String name;
    private final String type;
    private long hp;
    private final long defense;
    private final Strategy strategy;
    private Position position;
    private final Player owner;
    private boolean isDone = false;

    public Minion(String name, String type, long defense, Strategy strategy, Position position, Player owner){
        this.name = name;
        this.type = type;
        this.hp = Config.init_hp;
        this.defense = defense;
        this.strategy = strategy;
        this.position = position;
        this.owner = owner;
    }

    public Player getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public long getHp(){
        return hp;
    }

    public void stopExecution() {
        isDone = true;
    }

    public void resetExecution() {
        isDone = false;
    }

    public boolean hasEndedTurn() {
        return isDone;
    }

    public boolean isAlive() {
        return hp >= 1;
    }

    public long getDefense() { 
        return defense; 
    }

    public void takeDamage(GameState gameState, long damage) {
        hp = Math.max(0, hp - damage);
        System.out.println(name + " took " + damage + " damage. HP: " + hp);

        if (hp == 0) {
            System.out.println(name + " has been eliminated!");
            gameState.removeMinion(this);
            owner.removeMinion(this);
        }
    }

    public void execute(GameState gameState, Minion minion) {
        if (isDone || !isAlive()) return; // 🔥 เพิ่มตรงนี้

        try {
            strategy.execute(gameState, minion);
        } catch (StrategyException e) {
            System.out.println("Strategy stopped for " + minion.getName() + ": " + e.getMessage());
            minion.stopExecution();
        }
    }

    public void setPosition(Position newPosition) {
        this.position = newPosition;
    }

    public Position getPosition() {
        return position;
    }
    
    public String getType() {
        return type;
    }
}
