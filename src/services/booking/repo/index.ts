import { Pool, QueryResult } from "pg";

export default class BookingRepo {
    constructor(private pool: Pool) {}
    
    private date(timestamp?: number | string) {
        var temp = new Date(timestamp || Date.now());
        var dateStr =
            this.padStr(temp.getFullYear()) +
            `-` +
            this.padStr(1 + temp.getMonth()) +
            `-` +
            this.padStr(temp.getDate());
        return dateStr;
    }

    private padStr(i: number) {
        return i < 10 ? "0" + i : "" + i;
    }

    getUserFilters = async () => {
        const countryQuery = `select * from public.country`;
        const cityQuery = `select * from public.city join public.region on public.region.id=public.city.id_region`;
        const roomQuery = `select distinct bedroom_count from public.property`;
        const amenitiesQuery = `select * from public.amenities`;
        const regionQuery = `select * from public.region`;
        const categoryQuery = `select * from public.category`;

        const requests = {
            countryQuery,
            cityQuery,
            roomQuery,
            amenitiesQuery,
            regionQuery,
            categoryQuery
        };

        const result = {};

        for (let i in requests) {
            const res: QueryResult = await this.pool.query(
                requests[i as keyof typeof requests]
            );
            (result as any)[i] = res.rows;
        }

        return result;
    };

    dropPost = async (id: number) => {
        const amenityQuery = `delete from public.property_amenities where id_property=$1`
        const bookingsQuery = `delete from public.booking where id_property=$1`
        const query = `delete from public.property where id=$1`;
        await this.pool.query(amenityQuery,[id]);
        await this.pool.query(bookingsQuery, [id])
        const res = await this.pool.query(query, [id]);
        return res.rowCount > 0;
    };

    book = async (
        user: number,
        date_from: string,
        date_to: string,
        property: number
    ) => {
        const propertyQuery = `select * from public.property where id=$1`;
        const transQuery = `insert into public.transaction (id,id_user,id_currency,amount,date) values ($1,$2,$3,$4,$5)`;
        const transNumberQuery = `select count(*) as count from public.transaction;`;
        const propertyInfo: { [key: string]: number } = (
            await this.pool.query(propertyQuery, [property])
        ).rows[0];

        const transNumber: number = (await this.pool.query(transNumberQuery))
            .rows[0].count;

        const bookingQuery = `insert into public.booking values ($1,$2,$3,$4,$5,$6,$7)`;
        const bookingNumberQuery = `select count(*) as count from public.booking;`;
        const bookingNumber: number = (
            await this.pool.query(bookingNumberQuery)
        ).rows[0].count;
        const bookingCost =
            (Number(propertyInfo.price_per_night) *
                ((new Date(date_to) as any) - (new Date(date_from) as any))) /
            (60 * 60 * 24 * 1000);
        const createTransaction = await this.pool.query(transQuery, [
            Number(transNumber) + 1,
            user,
            1,
            bookingCost,
            this.date(),
        ]);
        if (createTransaction.rowCount > 0) {
            const book = await this.pool.query(bookingQuery, [
                Date.now() % 100000,
                property,
                user,
                this.date(date_from),
                this.date(date_to),
                bookingCost,
                Number(transNumber) + 1,
            ]);
            return book.rowCount > 0 ? bookingCost : false;
        }

        return false;
    };

    createPost = async (user: number, amenities: number, country: number, city: number, bedrooms: number, price: number, category: number) => {
        const createLocationQuery = `insert into public.location values ($1,$2,$3,$4,$5,$6,$7) returning id`;
        const locationNumberQuery = `select count(*) as count from public.location`;
        const propertyNumberQuery = `select count(*) as count from public.location`;
        const createPropertyQuery = `insert into public.property values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`;
        const createAmenitiesQuery = `insert into public.property_amenities values ($1,$2,$3)`;
        const locationAmount = (await this.pool.query(locationNumberQuery)).rows[0].count;
        const location = (await this.pool.query(createLocationQuery, [Number(locationAmount)+1, country, 1, city, "", 0, 0])).rows[0].id;
        const propertyAmount = (await this.pool.query(propertyNumberQuery)).rows[0].count;
        const post = await this.pool.query(createPropertyQuery, [Date.now() % 100000, Number(location), category, user, bedrooms, 0, 0, 0, price]);

        await this.pool.query(createAmenitiesQuery, [Number(post.rows[0].id), amenities, 150]);
        
        return true;
    }

    getPosts = async () => {
        const query = `select * from public.property prop`
        const posts = await this.pool.query(query);
        return posts.rows;
    }

    getAmenities = async (prop_id: number) => {
        const query = `select * from public.property_amenities pa
                        join public.amenities a on a.id=pa.id_amenity
                        where pa.id_property=$1`
        return (await this.pool.query(query,[prop_id])).rows;
    }

    getLocation = async (id: number) => {
        const query = `select * from public.location where id=$1`
        return (await this.pool.query(query,[id])).rows[0];
    }

    getCategory = async (id: number) => {
        const query = `select * from public.category where id=$1`
        return (await this.pool.query(query,[id])).rows[0];
    }

    getBooking = async (prop_id: number) => {
        const query = `select * from public.booking bo where bo.id_property=$1`;
        return (await this.pool.query(query, [prop_id])).rows;
    }
}
