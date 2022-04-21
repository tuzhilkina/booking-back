import express from 'express';
import ApiController from '../controllers/api';

export class ApiRouter {

    router = express.Router();
    path="/api";

    constructor(api: ApiController) {
        this.router.get('/filters', api.getFilters)
        this.router.post('/book', api.book)
        this.router.get('/post', api.getPosts)
        this.router.post('/post/create', api.createPost)
        this.router.get('/post/drop', api.dropPost)
        this.router.get('/post/watch', api.addWatch)
    }
}