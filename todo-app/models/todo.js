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
      // define association here
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    static getTodos() {
      return this.findAll();
    }

    static async overdue() {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date(),
            },
            completed: false,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    static async dueToday() {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.eq]: new Date(),
            },
            completed: false,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    static async dueLater() {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date(),
            },
            completed: false,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    static async completedItems() {
      try {
        return this.findAll({
          where: {
            completed: true,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    setCompletionStatus(status) {
      return this.update({ completed: status });
    }

    static async remove(id) {
      try {
        return this.destroy({
          where: {
            id,
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
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
