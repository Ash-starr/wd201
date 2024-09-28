// models/todo.js

/* eslint-disable no-undef, no-unused-vars */
"use strict";
const { Model, Op } = require("sequelize");

const formattedDate = (d) => {
  return d.toISOString().split("T")[0];
};

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      const overdueItems = await this.overdue();
      overdueItems.forEach((todo) => {
        console.log(todo.displayableString());
      });
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      const todayItems = await this.dueToday();
      todayItems.forEach((todo) => {
        console.log(todo.displayableString());
      });
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      const laterItems = await this.dueLater();
      laterItems.forEach((todo) => {
        console.log(todo.displayableString());
      });
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      const today = formattedDate(new Date());
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: today, // less than today
          },
          // completed: false, // only incomplete tasks
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      const today = formattedDate(new Date());
      return await Todo.findAll({
        where: {
          dueDate: today, // exactly today
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const today = formattedDate(new Date());
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: today, // greater than today
          },
          // completed: false, // only incomplete tasks
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      // return await Todo.update(
      //   { completed: true },
      //   {
      //     where: { id },
      //   }
      // );
      const todo = await Todo.findByPk(id);

      if (todo) {
        todo.completed = true;
        await todo.save();
      }
    }

    // displayableString() {
    //   let checkbox = this.completed ? "[x]" : "[ ]";
    //   return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    // }
    displayableString() {
      const checkbox = this.completed ? "[x]" : "[ ]";
      const dueDateFormatted =
        this.dueDate instanceof Date
          ? formattedDate(this.dueDate)
          : this.dueDate;

      // Get today's date for comparison
      const today = formattedDate(new Date());

      // Handle different cases based on completion status and due date
      if (this.completed) {
        if (this.dueDate < today) {
          // For completed past-due tasks
          return `${this.id}. ${checkbox} ${this.title.trim()} ${dueDateFormatted}`;
        } else {
          // For completed tasks that are not past due (no date shown)
          return `${this.id}. ${checkbox} ${this.title.trim()}`;
        }
      } else {
        if (this.dueDate < today) {
          // For incomplete past-due tasks (not specified in requirements but can be handled)
          return `${this.id}. ${checkbox} ${this.title.trim()} ${dueDateFormatted}`;
        } else if (this.dueDate === today) {
          // For incomplete tasks due today (no date shown)
          return `${this.id}. ${checkbox} ${this.title.trim()}`;
        } else {
          // For incomplete future tasks
          return `${this.id}. ${checkbox} ${this.title.trim()} ${dueDateFormatted}`;
        }
      }
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
    },
  );
  return Todo;
};

/* eslint-enable no-undef, no-unused-vars */
