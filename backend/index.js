const express = require('express');
const port = 3000;
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./utils/connectDB')

const app = express();
app.use(express.json());

app.use(cors());

// Connect to MongoDB
connectDB();


app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})


