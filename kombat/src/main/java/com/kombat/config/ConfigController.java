package com.kombat.config;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://kombat-nine.vercel.app"
})
public class ConfigController {

    @GetMapping(produces = "application/json")
    public Config getConfig() {
        Config c = new Config();
        // copy static → instance เพื่อ serialize เป็น JSON
        c.spawn_cost = Config.spawn_cost;
        c.hex_purchase_cost = Config.hex_purchase_cost;
        c.init_budget = Config.init_budget;
        c.init_hp = Config.init_hp;
        c.turn_budget = Config.turn_budget;
        c.max_budget = Config.max_budget;
        c.interest_pct = Config.interest_pct;
        c.max_turns = Config.max_turns;
        c.max_spawns = Config.max_spawns;
        return c;
    }

    @PostMapping(consumes = "application/json")
    public Config updateConfig(@RequestBody Config newConfig) {
        // อัพเดทแค่ใน memory ไม่แตะไฟล์
        Config.spawn_cost = newConfig.spawn_cost;
        Config.hex_purchase_cost = newConfig.hex_purchase_cost;
        Config.init_budget = newConfig.init_budget;
        Config.init_hp = newConfig.init_hp;
        Config.turn_budget = newConfig.turn_budget;
        Config.max_budget = newConfig.max_budget;
        Config.interest_pct = newConfig.interest_pct;
        Config.max_turns = newConfig.max_turns;
        Config.max_spawns = newConfig.max_spawns;

        System.out.println("Config updated in memory!");
        return newConfig;
    }
}