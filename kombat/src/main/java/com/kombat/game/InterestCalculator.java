package com.kombat.game;

import com.kombat.config.Config;
import com.kombat.player.Player;

public class InterestCalculator {
    private static final long BASE_RATE = Config.interest_pct;

    public static long calculateInterest(Player player, int turn) {
        long budget = player.getBudget();

        if (budget > 0 && turn > 1) {
            double interestRate = BASE_RATE * Math.log10(budget) * Math.log(turn);
            double interest = (budget * interestRate) / 100;

            return Math.round(interest);
        }
        return 0;

    }

    public static void applyInterest(Player player, int turn) {
        long interest = calculateInterest(player, turn);
        player.addBudget(interest);

        System.out.printf("%s Earn interest %d (Rate: %d%%), new budget: %d%n",
                player.getName(), Math.round(interest), BASE_RATE, Math.round(player.getBudget()));
    }
}
