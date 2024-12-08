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
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Set up multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(__dirname, 'uploads');
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true }); // Create the directory if it doesn't exist
		}
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	},
});
const upload = multer({ storage });


/**
 * Save a newly created token to the DB
 */
app.post("/api/tokens", upload.single('image'), async (req, res) => {
	try{
		let data = req.body;
		const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

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
				hashscanUrl: data.hashscan_url,
				image: imagePath,
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
 * DISCUSSION ENDPOINTS
 * ==========================================================================
 */

// Get threads by token ID
app.get('/api/threads/:tokenId', async (req, res) => {
	try {
		const { tokenId } = req.params;
		const prisma = new PrismaClient();

		const threads = await prisma.threads.findMany({
			where: { token_id: tokenId },
			include: { replies: true }, // Include associated replies
		});
		res.status(200).json(threads);
	} catch (error) {
		console.error('Error fetching threads:', error);
		res.status(500).json({ error: 'Error fetching threads' });
	}
});

// Create a new thread
app.post('/api/threads', async (req, res) => {
	const { tokenId, title, content, author } = req.body;

	try {
		const prisma = new PrismaClient();

		const newThread = await prisma.threads.create({
			data: {
				token_id: tokenId,
				title,
				content,
				author: author || 'Unknown User',
			},
		});
		res.status(201).json(newThread);
	} catch (error) {
		console.error('Error creating thread:', error);
		res.status(500).json({ error: 'Error creating thread' });
	}
});

// Create a reply
app.post('/api/replies', async (req, res) => {
	const { threadId, content, author } = req.body;

	try {
		const prisma = new PrismaClient();

		const newReply = await prisma.replies.create({
			data: {
				thread_id: threadId,
				content,
				author,
			},
		});
		res.status(201).json(newReply);
	} catch (error) {
		console.error('Error creating reply:', error);
		res.status(500).json({ error: 'Error creating reply' });
	}
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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