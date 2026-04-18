package com.kombat.config;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Config {
    public static long spawn_cost;
    public static long hex_purchase_cost;
    public static long init_budget;
    public static long init_hp;
    public static long turn_budget;
    public static long max_budget;
    public static long interest_pct;
    public static long max_turns;
    public static long max_spawns;

    public static void loadFromFile() {
        ConfigReader config = ConfigReader.getInstance();
        spawn_cost = (long) config.getIntProperty("spawn_cost");
        hex_purchase_cost = (long) config.getIntProperty("hex_purchase_cost");
        init_budget = (long) config.getDoubleProperty("init_budget");
        init_hp = (long) config.getIntProperty("init_hp");
        turn_budget = (long)config.getIntProperty("turn_budget");
        max_budget = (long) config.getIntProperty("max_budget");
        interest_pct = (long) config.getDoubleProperty("interest_pct");
        max_turns = (long) config.getIntProperty("max_turns");
        max_spawns = (long) config.getIntProperty("max_spawns");
    }

    public long getSpawn_cost() { return spawn_cost; }
    public long getHex_purchase_cost() { return hex_purchase_cost; }
    public long getInit_budget() { return init_budget; }
    public long getInit_hp() { return init_hp; }
    public long getTurn_budget() { return turn_budget; }
    public long getMax_budget() { return max_budget; }
    public long getInterest_pct() { return interest_pct; }
    public long getMax_turns() { return max_turns; }
    public long getMax_spawns() { return max_spawns; }

    public void setSpawn_cost(long spawn_cost) { Config.spawn_cost = spawn_cost; }
    public void setHex_purchase_cost(long hex_purchase_cost) { Config.hex_purchase_cost = hex_purchase_cost; }
    public void setInit_budget(long init_budget) { Config.init_budget = init_budget; }
    public void setInit_hp(long init_hp) { Config.init_hp = init_hp; }
    public void setTurn_budget(long turn_budget) { Config.turn_budget = turn_budget; }
    public void setMax_budget(long max_budget) { Config.max_budget = max_budget; }
    public void setInterest_pct(long interest_pct) { Config.interest_pct = interest_pct; }
    public void setMax_turns(long max_turns) { Config.max_turns = max_turns; }
    public void setMax_spawns(long max_spawns) { Config.max_spawns = max_spawns; }
    }
