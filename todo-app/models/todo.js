"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
      // define association here
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    static getTodos() {
      return this.findAll();
    }

    static async overdue(userId) {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date(),
            },
            userId,
            completed: false,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    static async dueToday(userId) {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.eq]: new Date(),
            },
            userId,
            completed: false,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    static async dueLater(userId) {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date(),
            },
            userId,
            completed: false,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    static async completedItems(userId) {
      try {
        return this.findAll({
          where: {
            completed: true,
            userId,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    setCompletionStatus(status) {
      return this.update({ completed: status });
    }

    static async remove(id, userId) {
      try {
        return this.destroy({
          where: {
            id,
            userId,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
      dueDate: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
