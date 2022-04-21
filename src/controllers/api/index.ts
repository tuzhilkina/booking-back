import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import BookingService from "../../services/booking";

export default class ApiController {
    constructor (private booking: BookingService, private client: any, private mongo: MongoClient) {}

    private getFromRedis = async (id: number) => {
        return await this.client.get(id.toString()) || 0
    }

    private setRedis = async (id: number, value: any) => {
        return await this.client.set(id.toString(), value.toString());
    }


    getFilters = async (req: Request, res: Response) => {
        try {
            const resp = await this.booking.getFilters();
            res.status(200).json(resp);
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }

    book = async (req: Request, res: Response) => {
        try {
            const { user, date_from, date_to, property } = req.body;
            const resp = await this.booking.book(user, date_from, date_to, property);
            res.status(200).json(resp);
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }

    createPost = async (req: Request, res: Response) => {
        try {
            const { user, amenity, country, city, region, rooms, price, category } = req.body;
            const resp = await this.booking.createPost(user, amenity, country, city, region, rooms, price, category);
            res.status(200).json(resp);
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }

    dropPost = async (req: Request, res: Response) => {
        try {
            const { id } = req.query;
            const resp = await this.booking.dropPost(Number(id));
            res.status(200).json(resp);
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }

    getPosts = async (req: Request, res: Response) => {
        try {
            const resp = await this.booking.getPost();
            const posts = await Promise.all(resp.map(async (el) => {
                const amenity = await this.booking.getAmenity(el.id);
                const booking = await this.booking.getBooking(el.id);
                const watches = await this.getFromRedis(Number(el.id));
                const location = await this.booking.getLocation(el.id_location);
                const category = await this.booking.getCategory(el.id_category);
                el.name = category.name
                el.id_country = location.id_country                
                el.id_city = location.id_city                
                el.watches = watches;
                el.amenity = amenity;
                el.booking = booking;
                return el;
            }));
            res.status(200).json(posts);
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }

    addWatch = async (req: Request, res: Response) => {
        try {
            const { id } = req.query;
            const currentId = await this.getFromRedis(Number(id));
            await this.setRedis(Number(id), Number(currentId) + 1);
            res.status(200).json(Number(currentId) + 1);
        } catch(err) {
            console.log(err)
        }
    }

}