const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.json());

const { Todo } = require("./models");
const { Model } = require("sequelize");

app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  if (request.accepts("html")) {
    response.render("index", { allTodos });
  } else {
    response.json({ allTodos });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: "Failed to retrieve todos" });
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  // todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("We have to update a todi with ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  const todoID = request.params.id;
  try {
    const deleted = await Todo.destroy({ where: { id: todoID } });
    if (deleted) {
      return response.json(true);
    } else {
      return response.json(false);
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
