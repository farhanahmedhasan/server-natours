import Tour from '../models/tourModel.js';

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalDocuments;
    this.limit;
    this.page;
    this.skip;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`));

    this.query = this.query.find(queryStr);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sort = this.queryString.sort;
      const sortBy = sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('price');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  async paginate() {
    this.page = this.queryString.page * 1 || 1;
    this.limit = this.queryString.limit * 1 || 6;
    this.skip = (this.page - 1) * this.limit;
    this.totalDocuments = await Tour.countDocuments({});
    this.query = this.query.skip(this.skip).limit(this.limit);

    if (this.queryString.page) {
      const numTours = await Tour.estimatedDocumentCount();

      if (this.skip >= numTours) throw new Error('This page does not exist');
    }

    return this;
  }
}

export default ApiFeatures;
