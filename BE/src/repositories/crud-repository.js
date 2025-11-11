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
            const [rowEffected] = await this.model.update(data, {
                where: {
                    id: id
                }
            });
            if (rowEffected === 0) {
                return null;
            }
            return await this.model.findByPk(id);
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

    async findAllWithField(field, data) {
        try {
            const res = await this.model.findAll({
                where: {
                    [field]: data
                }
            });
            return res;
        } catch (error) {
            console.error("Error in CRUD (findAllWithField):", error);
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
    async getAllPagination(page = 1, limit =  10, where = {} , order = [['id', 'ASC']]){
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await this.model.findAndCountAll({
                where,
                order,
                offset,
                limit
            });
            console.log("Pagination Result:", { count, rows, page, limit, offset });
            return {
                data: rows,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalPages: Math.ceil(count / limit),
                }
            }
        }
        catch (error) {
            console.error("Error in CRUD (getAllPagination):", error);
            throw error;
        }
    }
}

module.exports = CrudRepository;