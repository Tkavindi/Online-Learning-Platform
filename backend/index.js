const express = require('express');
const port = 3000;
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./utils/connectDB');
const userRoute = require('./routes/userRoute');
const courseRoute = require('./routes/courseRoute');
const enrollmentRoute = require('./routes/enrollmentRoute');


const app = express();
app.use(express.json());

app.use(cors());

// Connect to MongoDB
connectDB();


app.use('/api/users', userRoute);
app.use('/api/courses', courseRoute);
app.use('/api/enrollments', enrollmentRoute);



app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})


