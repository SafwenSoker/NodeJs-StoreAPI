require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

const connectDB = require('./db/connect')

const productsRouter  = require('./routes/products')

app.use(express.json())

app.get('/', (req,res)=>{
    res.send("StoreAPI <a href='/api/v1/products'>products</a>")
})

app.use('/api/v1/products',productsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is listening on port ${port}`))
    } catch (error) {
        console.log(error);
    }
}
start()