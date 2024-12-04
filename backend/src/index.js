"use server"
const express = require("express");
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const multer = require('multer');

const PORT = process.env.PORT || 3080;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
const prisma = new PrismaClient();


// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/'); // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Use unique filenames
    },
});
const upload = multer({ storage });


/**
 * Token API
 */
app.post("/api/tokens", async (req, res) => {
	try{
		let data = req.body;
		const imagePath = req.file ? req.file.path : null;
		console.log( data );

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

app.get("/api/tokens", async (req, res) => {
    try{
        let token_id = req.query.token_id;
		console.log("this: ", token_id)

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
	console.log("Create: ", { tokenId, title, content, author });
    try {
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
	console.log("Create Reply: ", { threadId, content, author });
    try {
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


app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});