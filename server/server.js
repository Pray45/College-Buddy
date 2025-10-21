import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(cors());


app.get('/' , (req,res)=> {
    res.json("Hello jii");
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});