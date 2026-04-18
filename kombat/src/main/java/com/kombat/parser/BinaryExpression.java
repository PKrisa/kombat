package com.kombat.parser;

import com.kombat.game.GameState;
import com.kombat.minion.Minion;

public class BinaryExpression implements Expression {
    final Expression left, right;
    final String operator;

    public BinaryExpression(Expression left, String operator, Expression right ) {
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    @Override
    public long evaluate(GameState gameState, Minion minion) {
        long leftVal = left.evaluate(gameState, minion);
        long rightVal = right.evaluate(gameState, minion);

        return switch (operator) {
            case "+" -> leftVal + rightVal;
            case "-" -> leftVal - rightVal;
            case "*" -> leftVal * rightVal;
            case "/" -> rightVal != 0 ? leftVal / rightVal : 0;
            case "%" -> rightVal != 0 ? leftVal % rightVal : 0;
            case "^" -> leftVal ^ rightVal;
            default -> throw new IllegalArgumentException("Unknown " + operator);
        };
    }
}
