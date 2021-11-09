const advancedResutls = (model, populate) => async (req, res, next) => {
    // console.log(req.query);
    let query;

    // Copy req.query
    const reqQuery = {...req.query}

    // Fields to exclue
    const removeFields = ['select', 'sort', 'page', 'limit']

    // Loop over rem fields and delete  them from reqQuery
    removeFields.forEach(param => delete reqQuery[param])

    // Create query string
    let queryString = JSON.stringify(reqQuery)

    // Create opertors (gt, etc)
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g , match => `$${match}`)

    // Finding resourse
    query = model.find(JSON.parse(queryString))

    // Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }
    // Sort 
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy)
    } else{
        query = query.sort('-createdAt')
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 4;
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit)


    if(populate){
        query = query.populate(populate)
    }

    // Excute query string
    const results = await query;

    // Pagination result
    const pagination = {}

    if(endIndex<total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    res.advancedResults = {
        succees: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
    
}
module.exports = advancedResutls