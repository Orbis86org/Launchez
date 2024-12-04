// src/classes/BondingCurve.js
/**
 * Why Use a Virtual Supply Greater Than the Actual Supply?
 * The bonding curve formula used is:
 *
 * k=va×vb
 *
 * Where:
 *
 * k is a constant.
 * va is the virtual token supply.
 * vb is the virtual HBAR collateral.
 *
 * Reasons for the Extra 20 Million Virtual Tokens:
 *
 * Smooth Price Increase:
 *
 * Initial Price Setting: By using a larger virtual supply, the initial price of the token is lower, making it more accessible to early buyers.
 * Gradual Price Rise: As tokens are bought, the price increases more smoothly, preventing sharp spikes.
 * Mathematical Necessity:
 *
 * Modeling Purposes: The virtual supply aids in achieving the desired price dynamics within the bonding curve model.
 * Constant Product: Ensures the constant
 * 𝑘
 * k remains balanced as tokens are bought and sold.
 * Fairness and Accessibility:
 *
 * Early Participation: Encourages early adoption by offering tokens at a lower price initially.
 * Avoiding Market Shock: Prevents sudden price jumps that could deter new buyers.
 *
 * What Happens to the Extra 20 Million Tokens?
 * They Are Not Minted: The 20 million extra tokens are never created on the blockchain.
 * No Actual Distribution: They are not distributed to anyone—neither the team nor the public.
 * Purely Theoretical: They exist only within the mathematical framework of the bonding curve to facilitate price calculations.
 */

class BondingCurve {
    /**
     * Constructor to initialize the BondingCurve class.
     * Initializes with a fixed supply of 720 million tokens and 34,300 Hbar liquidity.
     */
    constructor() {
        this.initialSupply = process.env.REACT_APP_HEDERA_TOKEN_INITIAL_SUPPLY; // Initial supply of token X (720 million tokens with 8 decimals) - Virtual Supply
        this.totalSupply = process.env.REACT_APP_HEDERA_TOKEN_TOTAL_SUPPLY; // Total supply of token X (700 million tokens with 8 decimals)
        this.maxSaleSupply = process.env.REACT_APP_HEDERA_TOKEN_MAX_SALE_SUPPLY; // Max tokens to sell normally (565 million tokens with 8 decimals)
        this.maxSaleSupplyWithLastTrade = 57500000000000000; // Max tokens to sell in the last large trade (575 million tokens with 8 decimals)
        this.b = 34300; // Initial liquidity of token Y (Hbar)
        this.k = this.initialSupply * this.b; // Constant k = initial supply * initial liquidity
        this.a = this.initialSupply; // Start with the initial supply as the available supply
        this.soldTokens = 0; // Track the total number of tokens sold
    }

    /**
     * Calculate the current price of token X in terms of token Y.
     * @returns {number} - The current price of token X.
     */
    calculateCurrentPrice() {
        return this.b / this.a; // Price of X in terms of Y
    }

    /**
     * Calculate the price of token X after a buy transaction.
     * Adjusts for the 2% transaction fee.
     * @param {number} amountY - The amount of token Y added to the pool.
     * @returns {number} - The new price of token X.
     */
    calculatePriceAfterBuy(amountY) {
        const feeY = amountY * 0.02;
        const netAmountY = amountY - feeY;
        const newB = this.b + netAmountY;
        const newA = this.k / newB;
        return newB / newA; // New price after the buy
    }

    /**
     * Simulate a buy transaction to estimate the final price and amount of token X received.
     * Enforces the token sale restrictions (565 million cap, 575 million last trade).
     * Adjusts for the 2% transaction fee.
     * Updates the current supply and liquidity values.
     * @param {number} amountY - The amount of token Y to spend.
     * @returns {Object} - The final price, amount of token X received, and slippage percentage.
     * @throws {Error} - If the purchase would exceed allowed token limits.
     */
    simulateBuy(amountY) {
        const initialPrice = this.calculateCurrentPrice();
        const feeY = amountY * 0.02;
        const netAmountY = amountY - feeY;

        // Estimate the number of tokens that will be bought
        const estimatedAmountX = this.a - (this.k / (this.b + netAmountY));
        const newSoldTokens = this.soldTokens + estimatedAmountX;

        // Check if this purchase would exceed the max sale limits
        if (newSoldTokens > this.maxSaleSupply) {
            if (newSoldTokens > this.maxSaleSupplyWithLastTrade) {
                throw new Error("This purchase exceeds the maximum allowable tokens for sale.");
            }
        }

        // Proceed with the transaction
        this.b += netAmountY;
        this.a -= estimatedAmountX;
        this.soldTokens += estimatedAmountX;

        const finalPrice = this.calculatePriceAfterBuy(netAmountY);
        return {
            finalPrice: finalPrice,
            amountX: estimatedAmountX,
            slippage: this.calculateSlippage(initialPrice, finalPrice)
        };
    }

    /**
     * Calculate the price of token X after a sell transaction.
     * Adjusts for the 2% transaction fee.
     * @param {number} amountX - The amount of token X sold.
     * @returns {number} - The new price of token X.
     */
    calculatePriceAfterSell(amountX) {
        const newA = this.a + amountX;
        const newB = this.k / newA;
        const feeY = (this.b - newB) * 0.02;
        return newB / newA; // New price after the sell
    }

    /**
     * Calculate the slippage based on the transaction size.
     * @param {number} initialPrice - The initial price before the transaction.
     * @param {number} finalPrice - The final price after the transaction.
     * @returns {number} - The slippage percentage.
     */
    calculateSlippage(initialPrice, finalPrice) {
        return ((finalPrice - initialPrice) / initialPrice) * 100; // Slippage in percentage
    }

    /**
     * Simulate a sell transaction to estimate the final price and amount of token Y received.
     * Adjusts for the 2% transaction fee.
     * Updates the current supply and liquidity values.
     * @param {number} amountX - The amount of token X to sell.
     * @returns {Object} - The final price, amount of token Y received, and slippage percentage.
     */
    simulateSell(amountX) {
        const initialPrice = this.calculateCurrentPrice();
        const newA = this.a + amountX;
        const newB = this.k / newA;
        const feeY = (this.b - newB) * 0.02;
        const netAmountY = this.b - newB - feeY;
        this.a = newA;
        this.b = newB;
        const finalPrice = newB / newA;
        return {
            finalPrice: finalPrice,
            amountY: netAmountY,
            slippage: this.calculateSlippage(initialPrice, finalPrice)
        };
    }

    /**
     * Calculate the market cap of token X in terms of token Y (Hbar).
     * Uses the total supply of token X for calculation.
     * @returns {number} The market cap of token X in terms of token Y (Hbar).
     */
    calculateMarketCap() {
        const currentPrice = this.calculateCurrentPrice();
        return this.totalSupply * currentPrice; // Market cap based on total supply of token X
    }
}

export default BondingCurve;
