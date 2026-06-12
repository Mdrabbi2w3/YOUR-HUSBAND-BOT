/**
 * YOUR HUSBAND BOT - High-Performance Bitwise TicTacToe Game Engine
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

class TicTacToe {
    constructor(playerX = 'x', playerO = 'o') {
        this.playerX = playerX;
        this.playerO = playerO;
        this._currentTurn = false; // false = X's Turn, true = O's Turn
        this._x = 0;               // Bitmask representation for player X
        this._o = 0;               // Bitmask representation for player O
        this.turns = 0;
    }

    /**
     * Retrieves unified active board matrix state 
     */
    get board() {
        return this._x | this._o;
    }

    /**
     * Gets identifying data of the active turn owner
     */
    get currentTurn() {
        return this._currentTurn ? this.playerO : this.playerX;
    }

    /**
     * Core Bitwise Verification Engine to validate active winning configurations
     */
    get winner() {
        const winningPatterns = [
            0b111000000, // Top Row
            0b000111000, // Middle Row
            0b000000111, // Bottom Row
            0b100100100, // Left Column
            0b010010010, // Middle Column
            0b001001001, // Right Column
            0b100010001, // Diagonal Top-Left to Bottom-Right
            0b001010100  // Diagonal Top-Right to Bottom-Left
        ];

        // Execute parallel parsing check layers against mathematical grid definitions
        for (let i = 0; i < winningPatterns.length; i++) {
            const pattern = winningPatterns[i];
            if ((this._x & pattern) === pattern) return this.playerX;
            if ((this._o & pattern) === pattern) return this.playerO;
        }

        return null;
    }

    /**
     * Handles game validation rules matrix and state modification
     * @param {String} player - Active command caller ID string matching
     * @param {Number} pos - Operational grid selection target (0-8 range)
     * @returns {Number} - Outbound execution results metric signaling state changes (-1: Invalid/Ended, 0: Occupied, 1: Success)
     */
    turn(player, pos) {
        // 1. Terminate processing if bounds are crossed or sequence is completed
        if (this.winner || pos < 0 || pos > 8 || this.turns >= 9) return -1;
        
        // 2. Strict turn mapping validation logic rule alignment
        if (this.currentTurn !== player) return -1;
        
        // 3. Ensure targeted cell data field does not cross overlap boundaries
        const moveBit = 1 << pos;
        if ((this._x | this._o) & moveBit) return 0;
        
        // 4. Update memory metrics arrays directly based on structural bit mask changes
        if (this._currentTurn) {
            this._o |= moveBit;
        } else {
            this._x |= moveBit;
        }
        
        // Toggle system control configurations flags sequentially
        this._currentTurn = !this._currentTurn;
        this.turns++;
        return 1;
    }

    /**
     * Transforms numeric bit arrays to visual output layout parameters context arrays
     */
    render() {
        const gridOutput = [];
        for (let i = 0; i < 9; i++) {
            const checkBit = 1 << i;
            if (this._x & checkBit) {
                gridOutput.push('X');
            } else if (this._o & checkBit) {
                gridOutput.push('O');
            } else {
                gridOutput.push(String(i + 1));
            }
        }
        return gridOutput;
    }
}

module.exports = TicTacToe;

