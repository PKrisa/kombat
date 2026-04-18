package com.kombat.movement;

import java.util.ArrayList;
import java.util.List;

public record Position(int row, int col) {
    private static final int size = 8;

    public Position move(Direction direction) {
        int newRow = row , newCol = col;

        boolean isEvenCol = (col % 2 == 0);

        switch (direction) {
            case UP -> newRow--;
            case DOWN -> newRow++;
            case UPLEFT -> {
                newCol--;
                if (!isEvenCol) newRow--;
            }
            case UPRIGHT -> {
                newCol++;
                if (!isEvenCol) newRow--;
            }
            case DOWNLEFT -> {
                newCol--;
                if (isEvenCol) newRow++;
            }
            case DOWNRIGHT -> {
                newCol++;
                if (isEvenCol) newRow++;
            }
        }
        return new Position(newRow, newCol);
    }

    public boolean isAdjacent(Position other) {
        boolean thisIsEvenCol = (this.col % 2 == 0);

        int dr = this.row - other.row;
        int dc = this.col - other.col;

        return (dr == -1 && dc == 0) ||
                (dr == 1 && dc == 0)  ||
                (dr == (thisIsEvenCol ? -1 : 0) && dc == -1) ||
                (dr == (thisIsEvenCol ? -1 : 0) && dc == 1)  ||
                (dr == (thisIsEvenCol ? 0 : 1)  && dc == -1) ||
                (dr == (thisIsEvenCol ? 0 : 1)  && dc == 1);
    }

    public static boolean isValidPosition(Position position) {
        return position.row() >= 0 && position.row() < size &&
                position.col() >= 0 && position.col() < size;
    }

    public List<Position> adjacentPositions() {
        List<Position> adjacent = new ArrayList<>();

        for (Direction dir : Direction.values()) {
            Position nextPos = this.move(dir);
            if (Position.isValidPosition(nextPos)) {
                adjacent.add(nextPos);
            }
        }
        return adjacent;
    }

    @Override
    public String toString() {
        int r = this.row+1, c = this.col+1;
        return "(" + r + ", " + c + ")";
    }

    public Object getRow() {
        return row;
    }

    public Object getCol(){
        return col;
    }
}
