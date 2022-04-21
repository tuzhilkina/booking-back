import BookingRepo from "./repo";

export default class BookingService {

    constructor(private repo: BookingRepo) {}

    getFilters = async () => {
        return await this.repo.getUserFilters();
    }

    book = async (user: number, date_from: string, date_to: string, property: number) => {
        return await this.repo.book(user, date_from, date_to, property);
    }

    createPost = async (user: number, amenities: number, country: number, city: number, region: number, bedrooms: number, price: number, category: number) => {
        return await this.repo.createPost(user, amenities, country, city, bedrooms, price, category);
    }

    dropPost = async (id: number) => await this.repo.dropPost(id);

    getPost = async () => await this.repo.getPosts();

    getAmenity = async (id: number) => await this.repo.getAmenities(id);

    getBooking = async (id: number) => await this.repo.getBooking(id);

    getLocation = async (id: number) => await this.repo.getLocation(id);

    getCategory = async (id: number) => await this.repo.getCategory(id);

    
}