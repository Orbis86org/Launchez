"use server"
const express = require("express");
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const PORT = process.env.PORT || 3080;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

/**
 * Token API
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
				description: data.description,
				walletAddress: data.wallet_address,
				bondingCurveSupply: data.bonding_curve_supply,
				bondingCurveHbar: data.bonding_curve_hbar,
				hashscanUrl: data.hashscan_url
			},
		});

		res.json({ success: true, data: token });
	} catch (error) {
		console.log( error );

		res.json({ success: false });
	}
});
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
				res.json({
					success: true,
					data: token
				});
			}
		} else {
			let tokens = await prisma.token.findMany()

			res.json({
				success: true,
				data: tokens
			});
		}

    } catch (error) {
        console.log( error );

        res.json({ success: false });
    }
});
app.put("/api/tokens", async (req, res) => {
	try{
		let data = req.body;

		let token_id = data.token_id;

		const prisma = new PrismaClient();

		if( token_id ){
			let token = await prisma.token.update({
				where: {
					tokenID: token_id,
				},
				data: {
					bondingCurveSupply: data.bonding_curve_supply,
					bondingCurveHbar: data.bonding_curve_hbar,
				},
			})

			if( token ){
				res.json({
					success: true,
					data: token
				});
			}
		}

		res.json({ success: false });

	} catch (error) {
		console.log( error );

		res.json({ success: false });
	}
});

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});