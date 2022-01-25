const Product = require('../models/product')

const getAllProductsStatic = async(req,res)=>{
    const products = await Product.find({price: {$gt:50}}).sort('price')
    res.status(200).json({products : products, nbHits: products.length})
}
const getAllProducts = async(req,res)=>{
    const {featured, company, name,sort, select, numericFilters} = req.query
    const queryObject = {}
    if(featured){
        queryObject.featured = featured === 'true' ? true : false
    }
    if(company){
        queryObject.company = company
    }
    if(name){
        queryObject.name = {$regex:name,$options:'i'}
    }
    if(numericFilters){
        operatorMap = {
            '>' : '$gt',
            '>=' : '$gte',
            '=' : '$eq',
            '<' : '$lt',
            '<=' : '$lte'
        }
        
        numericFiltersList = numericFilters.split(',')
        //Solution 1 : 
        // let params = {}
        // Object.entries(operatorMap).forEach(([key,value]) => {            
        //     for (let index = 0; index < numericFiltersList.length; index++) {
        //         const element = numericFiltersList[index];
        //         parts = element.split(key)
        //         if (parts.length === 2){    
        //             queryObject[parts[0]] = {[value] : Number(parts[1])}
        //             console.log(queryObject);
        //         }
        //     }
        // });
        // Solution 2 :
        const regEx = /\b(<|<=|=|>|>=)\b/g
        let filters = numericFilters.replace(
            regEx,
            (match) => `-${operatorMap[match]}-`
        )
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach((item)=>{
            const [field, operator, value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator] : Number(value)}
            }
        })
    }
    let result = Product.find(queryObject)
    if(sort){
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt')
    }
    if(select){
        const selectList = select.split(',').join(' ')
        result = result.select(selectList)
    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    result = result.skip(skip).limit(limit)
    const products = await result
    res.status(200).json({products : products, nbHits:products.length})
}
module.exports = {
    getAllProducts,
    getAllProductsStatic
}