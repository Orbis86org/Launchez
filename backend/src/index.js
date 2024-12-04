/**
 * Token API
 */

"use server"
const express = require("express");
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const convertAccountIdToEVMAddress = require("./saucerswap/utils/helpers");
const Liquidity = require("./saucerswap/Liquidity");
const {AccountId} = require("@hashgraph/sdk");
const {sleep} = require("./saucerswap/utils/helpers");

const PORT = process.env.PORT || 3080;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


/**
 * =========================================================================
 * TOKEN ENDPOINTS
 * =========================================================================
 */


/**
 * Save a newly created token to the DB
 */
app.post("/api/tokens", async (req, res) => {
	try{
		let data = req.body;

		const prisma = new PrismaClient();
		let token = await prisma.token.create({
			data: {
				name: data.name,
				tokenId: data.token_id,
				ticker: data.ticker,
				memo: data.memo,
				description: data.description,
				walletAddress: data.wallet_address,
				bondingCurveSupply: data.bonding_curve_supply,
				bondingCurveHbar: data.bonding_curve_hbar,
				hashscanUrl: data.hashscan_url
			},
		});

		return res.json({ success: true, data: token });
	} catch (error) {
		console.log( error );

		return res.json({ success: false });
	}
});


/**
 * Get All Tokens In DB
 */
app.get("/api/tokens", async (req, res) => {
    try{
        let token_id = req.query.token_id;

        const prisma = new PrismaClient();

		if( token_id ){
			let token = await prisma.token.findFirst({
				where: {
					tokenId: token_id,
				},
			})

			if( token ){
				return res.json({
					success: true,
					data: token
				});
			}
		} else {
			let tokens = await prisma.token.findMany()

			return res.json({
				success: true,
				data: tokens
			});
		}

    } catch (error) {
        console.log( error );

        return res.json({ success: false });
    }
});

/**
 * Update an Existing Token in DB
 */
app.put("/api/tokens", async (req, res) => {
	try{
		let data = req.body;

		let token_id = data.token_id;

		const prisma = new PrismaClient();

		if( token_id ){
			let token = await prisma.token.update({
				where: {
					tokenId: token_id,
				},
				data: {
					bondingCurveSupply: data.bonding_curve_supply,
					bondingCurveHbar: data.bonding_curve_hbar,
				},
			})

			if( token ){
				return res.json({
					success: true,
					data: token
				});
			}
		}

		return res.json({ success: false });

	} catch (error) {
		console.log( error );

		return res.json({ success: false });
	}
});


/**
 * ==========================================================================
 * LIQUIDITY ENDPOINTS
 * ==========================================================================
 */

/**
 * Create a Liquidity Pool
 */
app.post("/api/liquidity/create", async (req, res) => {
	try{
		let data = req.body;
		let tokenId = data.token_id; // Token ID whose liquidity pool we are creating
		let tokenMinAmount = data?.token_min;
		let tokenDesiredAmount = data?.token_desired;

		/**
		 * Set up the Liquidity Class
		 */
		const clientConfig = {
			network: process.env.HEDERA_OPERATOR_NETWORK,
			accountId: process.env.HEDERA_OPERATOR_ID,
			privateKey: process.env.HEDERA_OPERATOR_KEY
		};

		const liquidity = new Liquidity(
			clientConfig,
			process.env.SAUCER_SWAP_CONTRACT_ADDRESS,
			process.env.HEDERA_MIRROR_NODE_BASE_URL
		);

		const liquidityPoolLink = await liquidity.getLiquidityPoolLink( tokenId );
		if( liquidityPoolLink ){
			return res.json({
				success: true,
				link: liquidityPoolLink
			});
		}


		const created = await liquidity.createNewHBARTokenLiquidityPool(
			tokenId,
			tokenDesiredAmount, // In smallest unit e.g. 135,000,000 (without comma)
			tokenMinAmount, // e.g. 135,000,000 (without comma)
			1 * Math.pow( 10, 8 ), // e.g. 120,000 (without comma) - In tinybars
			AccountId.fromString( process.env.HEDERA_OPERATOR_ID ).toSolidityAddress(),
			10000000 // Recommended value: 3,200,000 gwei (~ $0.27 USD) (without comma)
		);

		if( created ){
			return res.json({ success: true });
		}

		return res.json({ success: false });
	} catch (error) {
		console.log( error );

		return res.json({ success: false });
	}
});

/**
 * Create a Liquidity Pool
 */
app.get("/api/liquidity/tokens", async (req, res) => {
	try{
		let tokenId = req.query.token_id;

		/**
		 * Set up the Liquidity Class
		 */
		const clientConfig = {
			network: process.env.HEDERA_OPERATOR_NETWORK,
			accountId: process.env.HEDERA_OPERATOR_ID,
			privateKey: process.env.HEDERA_OPERATOR_KEY
		};

		const liquidity = new Liquidity(
			clientConfig,
			process.env.SAUCER_SWAP_CONTRACT_ADDRESS,
			process.env.HEDERA_MIRROR_NODE_BASE_URL
		);

		const liquidityPoolLink = await liquidity.getLiquidityPoolLink( tokenId );
		if( liquidityPoolLink ){
			return res.json({
				success: true,
				link: liquidityPoolLink
			});
		}

		return res.json({ success: false });
	} catch (error) {
		console.log( error );

		return res.json({ success: false });
	}
});



/**
 * Start The Server
 */
app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});