
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {

        const queryObj = { ...this.queryString }

        const excludeFields = ["page", "sort", "limit", "fields"]
        excludeFields.forEach(element => {
            delete queryObj[element];
        });


        // 2. Advanced Filtering
        // {difficulty:"easy",duration : { $gte : 5 }}
        // {difficulty:"easy",duration : { gte : 5 }}
        // gte,gt,lte,lt

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)


        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    sort() {


        // 3).Sorting ------------------------------------------------
        //  Ascending :- sort = price
        //  Descending :- sort = -price

        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            console.log("Sort by : ", sortBy);
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }
    limitFields() {

        // 4).Fields limiting -----------------------------------------
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            console.log("Fields : ", fields);
            this.query = this.query.select(fields);
        }
        else {
            // Excluding this v field
            // - means excluding this field 
            this.query = this.query.select("-__v");
        }

        return this;
    }
    paginate() {

        // 5).Pagination ---------------------------------------------
        const page = parseInt(this.queryString.page) || 1
        const limit = parseInt(this.queryString.limit) || 100
        const skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;