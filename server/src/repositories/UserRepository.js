const { User } = require('../database');

class UserRepository {
    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async create(userData) {
        return await User.create(userData);
    }

    async findById(id, options = {}) {
        return await User.findByPk(id, options);
    }

    async update(user, updateData) {
        // If 'user' is a Sequelize instance, we can just update it
        Object.assign(user, updateData);
        return await user.save();
    }
}

module.exports = new UserRepository();
