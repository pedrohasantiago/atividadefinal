import { query } from 'express';
import { Collection } from 'mongodb';
import { Request, Response } from './classes';

export class MongoDBController {

  collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  async runQuery(request: Request) {
    let series, num, distinct;
    const mongoLen = request.len.mongoLen;
    // Getting series and num
    if (mongoLen === null && !objectHasAnyProperty(request.query)) { // I want no series and there is no query
      num = await this.countCollection();
    } else if (mongoLen === null) { // I want no series, but I sent a query
      ({ num } = await this.getSeries(request.query, 0));
<<<<<<< HEAD
    } else { // User wants results + count.
=======
    } else {
>>>>>>> 030f7d495f577fd21c97dc35e2c69594c193a824
      ({ series, num } = await this.getSeries(request.query, mongoLen));
    }
    // Geting distinct fields
    if (request.distinct && request.distinct.length > 0) {
      distinct = await this.getManyDistinct(request.distinct, request.query);
    }
    return new Response(true, series, num, distinct);
  }

  async countCollection() {
    return await this.collection.countDocuments();
  }

  async getSeries(query: Record<string, string>, limit: number) {
    console.log(`Making query limited to ${limit}:`, query);
    const cursor = this.collection.find(query).limit(limit);
    const series = await cursor.toArray();
    const num = await cursor.count();
    return { series, num };
  }

  getManyDistinct(fields: string[], query: Record<string, string>) {
    return fields.reduce(async (acc, field) => {
      const distincts = field === 'fields'
        ? await this.getSetFields(query)
	      : await this.getOneDistinct(field, query);
      acc.then(obj => obj[field] = distincts);
      return acc;
    }, Promise.resolve(<Record<string, string[]>>{}))
  }

  async getOneDistinct(field: string, query: Record<string, string>): Promise<string[]> {
    console.log('Getting distinct:', field);
    return await this.collection.distinct(field, query);
  }

  async getSetFields(query: Record<string, string>): Promise<string[]> { // Improve this by getting result from MongoDB
    console.log('Getting set fields');
    const all = await this.collection.distinct('fields', query);
    const allKeys = all.reduce((acc, doc) => {
      Object.keys(doc).forEach(key => acc.add(key));
      return acc;
    }, new Set());
    return Array.from(allKeys);
  }

}
