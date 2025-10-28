class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const res = await this.model.create(data);
            return res;
        } catch (error) {
            console.error("Error in CRUD (create):", error);
            throw error;
        }
    }

    async destroy(data) {
        try {
            const res = await this.model.destroy({
                where: {
                    id: data
                }
            }); 
            return res;
        } catch (error) {
            console.error("Error in CRUD (destroy):", error);
            throw error;
        }
    }

    async get(data) {
        try {
            const res = await this.model.findByPk(data);
            return res;
        } catch (error) {
            console.error("Error in CRUD (get):", error);
            throw error;
        }
    }


    async getAll() {
        try {
            const res = await this.model.findAll();
            return res;
        } catch (error) {
            console.error("Error in CRUD (getAll):", error);
            throw error;
        }
    }


    async update(id, data) //data = obj
    {
        try {
            const res = await this.model.update(data, {
                where: {
                    id: id
                }
            });
            return res;
        } catch (error) {
            console.error("Error in CRUD (update):", error);
            throw error;
        }
    }

    async findOne(field, data) {
        try {
            const res = await this.model.findOne({
                where: {
                    [field]: data
                }
            });
            return res;
        } catch (error) {
            console.error("Error in CRUD (findOne):", error);
            throw error;
        }
    }


    async findOneWithAttributes(field, data, attributes) {
    try {
        const user = await this.model.findOne({
            where: { [field]: data },
            attributes: attributes // Chọn hoặc loại bỏ các trường
        });
        return user;
    } catch (error) {
        console.error("Error in UserRepository (findOneWithAttributes):", error);
        throw error;
    }
}
    
}

module.exports = CrudRepository;