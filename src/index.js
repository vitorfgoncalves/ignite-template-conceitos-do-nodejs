const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const checkIfUsernameExists = users.find(e => e.username === username);

  if(checkIfUsernameExists){
    request.user = checkIfUsernameExists;
    return next();
  }else {
    return response.status(404).json({error : 'Invalid user!'})
  }
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const checkIfUserAlreadyExists = users.find(e => e.username === username);

  if(checkIfUserAlreadyExists){
    return response.status(400).json({error : "User already exists!"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos : []
  }

  users.push(user)

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const newTodo = {
    id: uuidv4(),
    title,
    done : false,
    deadline : new Date(deadline),
    created_at : new Date(),
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;
  const {id} = request.params;

  const todoIndexExists = user.todos.findIndex(e => e.id === id);

  if(todoIndexExists > -1){
    
    const updatedTodo = {...user.todos[todoIndexExists], title, deadline : new Date(deadline)}

    user.todos.splice(todoIndexExists,1,updatedTodo)

    return response.json(updatedTodo);
  }
    return response.status(404).json({error : "Invalid Todo Id!"})

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const {id} = request.params;

  const todoIndexExists = user.todos.findIndex(e => e.id === id);

  if(todoIndexExists > -1){
    
    const updatedTodo = {...user.todos[todoIndexExists], done : true}

    user.todos.splice(todoIndexExists,1,updatedTodo)

    return response.json(updatedTodo);
  }
    return response.status(404).json({error : "Invalid Todo Id!"})
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const {id} = request.params;

  const todoIndexExists = user.todos.findIndex(e => e.id === id);

  if(todoIndexExists > -1){
    
    user.todos.splice(todoIndexExists,1)

    return response.status(204).send();
  }
    return response.status(404).json({error : "Invalid Todo Id!"})
});

module.exports = app;