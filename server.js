require('dotenv').config(); // Load environment variables from .env file

const app = require('./app/app');

// mogodb connection function
const connectDB = require('./config/db');

// server port
const PORT = process.env.PORT || 3000;

// mogodb connetion
connectDB();


// start server
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

