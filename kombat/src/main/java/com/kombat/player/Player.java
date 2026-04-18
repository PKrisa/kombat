package com.kombat.player;

import java.util.ArrayList;
import java.util.List;

import com.kombat.config.Config;
import com.kombat.minion.Minion;

public class Player {
    private String name;
    private final List<Minion> minions;
    private long budget;
    private final long maxBudget;
    private long spawnCount;
    private final long maxSpawn;
    private boolean hasPlacedFreeMinion = false;
    private boolean isBot;
    private int playerId; 
    
    public Player(String name, int playerId, boolean isBot){
        this.name = name;
        this.playerId = playerId;
        this.isBot = isBot;
        this.minions = new ArrayList<>();
        this.budget = Config.init_budget;
        this.maxBudget = Config.max_budget;
        this.spawnCount = 0;
        this.maxSpawn = Config.max_spawns;
    }

    public int getPlayerId() {
        return playerId;
    }

    public String getName(){
        return name;
    }
    
    public void setName(String name){
        this.name = name;
    }

    public boolean canSpawnMore() {
        return spawnCount <= maxSpawn;
    }

    public void addMinion(Minion minion) {
        if (canSpawnMore()) {
            minions.add(minion);
            spawnCount++;
        }
    }

    public void removeMinion(Minion minion) {
        minions.remove(minion);
    }

    public List<Minion> getMinions() {
        return minions;
    }

    public long getBudget() {
        return budget;
    }

    public void addBudget(double amount) {
        if((budget+amount) <= maxBudget){
            budget += amount;
        }else if(budget != maxBudget){
            budget = maxBudget;
        }
    }

    public boolean spendBudget(long amount) {
        if (budget >= amount) {
            budget = Math.max(0, budget - amount);
            System.out.println(name + " spent " + amount + ", new budget: " + getBudget());
            return true;
        }
        return false;
    }

    public long getSpawnCount() {
        return spawnCount;
    }

    public long getMaxSpawn() {
        return maxSpawn;
    }

    public void incrementSpawnCount() {
        this.spawnCount++;
    }

    public boolean hasPlacedFreeMinion() {
        return hasPlacedFreeMinion;
    }

    public void setPlacedFreeMinion(boolean placedFreeMinion) {
        this.hasPlacedFreeMinion = placedFreeMinion;
    }

    public boolean isBot() {
        return isBot;
    }

    public void setBot(boolean isBot) {
        this.isBot = isBot;
    }

    public boolean isDefeated() {
        return getMinions().isEmpty() || spawnCount >= maxSpawn;
    }
}
