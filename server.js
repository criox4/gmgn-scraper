require('dotenv').config();
const express = require('express');
const fetchTokenInfo = require('./services/fetchTokenInfo');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// POST endpoint to fetch token info by mint address
app.post('/fetch-token-info', async (req, res) => {
    const { mintAddress } = req.body;

    // Validate request body
    if (!mintAddress) {
        return res.status(400).json({
            success: false,
            error: 'Mint address is required',
        });
    }

    try {
        const tokenInfo = await fetchTokenInfo(mintAddress);

        // If token info is fetched successfully
        if (tokenInfo) {
            return res.status(200).json({
                success: true,
                data: tokenInfo,
            });
        } else {
            return res.status(404).json({
                success: false,
                error: 'Token info not found',
            });
        }
    } catch (error) {
        console.error('Error fetching token info:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
