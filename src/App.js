import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { createTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsExports from "./aws-exports";
import { toast } from "react-toastify";
toast.configure();
Amplify.configure(awsExports);

const App = () => {
  //State Variables
  const [todoList, setTodoList] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [todos, setTodos] = useState([]);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchTodos();
  }, []);

  // FUnction to list all to do present in system
  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      setTodoList(todoData.data.listTodos.items);
      setApiLoading(true);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  // Function to add to do item
  async function addTodo() {
    try {
      if (!name || !description) return;
      const todo = { name, description };
      setTodos([...todos, todo]);
      console.log(todo)
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
      const message = "Bingo! You have created a new Todo item";
      toast.success(message, {
        position: "top-right",
        autoClose: 0,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      fetchTodos();
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  // Function to delete todo item
  async function deleteTodoFun(id) {
    const request = { id: `${id}` };
    try {
      await API.graphql(
        graphqlOperation(deleteTodo, { input: request  })
      );
      const message = "Your Todo item have been deleted";
      toast.success(message, {
        position: "top-right",
        autoClose: 0,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      await fetchTodos();
    } catch (err) {
      console.log("error in deleting todo:", err);
    }
  }

  return (
    <div className="container d-flex justify-content-start flex-column mt-5">
      <div className="row">
        <div className="col-12 text-center">
          <h2>
            {" "}
            My To Do List &nbsp;{" "}
            {
              modalIsOpen === false ? (<i
                className="las la-plus"
                style={{ cursor: "pointer" }}
                onClick={() => setIsOpen(true)}
              ></i>) : (<i
                className="las la-minus"
                style={{ cursor: "pointer" }}
                onClick={() => setIsOpen(false)}
              ></i>)
            }
          </h2>
        </div>
      </div>
      {modalIsOpen === true && (
        <div className="row justify-content-md-center m-4">
          <div className="col-md-4 col-xs-12">
            <div className="form-group">
              <label htmlFor="name">Enter the Task</label>
              <input
                type="name"
                className="form-control"
                onChange={(event) => setName(event.target.value)}
                value={name}
                placeholder="Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Enter the Description </label>
              <input
                type="name"
                className="form-control"
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                value={description}
                placeholder="Description"
              />
            </div>

            <div className="col-12" style={{ paddingRight: "0px" }}>
              <button className="btn btn-primary float-right ml-2" onClick={addTodo}>
                Create Todo
              </button>
              <button
                className="btn btn-info float-right"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {apiLoading === true ? (
        <>
          {todoList.length > 0 && todoList !== null ? (
            <div className="row justify-content-md-center m-4">
              {todoList.map((item, idx) => (
                <div
                  className="card col-md-3 col-xs-12 m-2"
                  style={{
                    backgroundColor: "white",
                    color: "#000000",
                  }}
                  key={idx}
                >
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text">{item.description}</p>
                  </div>
                  <div
                    className="text-right"
                    style={{ cursor: "pointer" }}
                    onClick={() => deleteTodoFun(item.id)}
                  >
                    {" "}
                    <i className="las la-trash"></i>{" "}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <h5 className="text-center mt-2">
              {" "}
              Oops you don't have any Task in your To Do List!
            </h5>
          )}
        </>
      ) : (
        <div className="d-flex justify-content-center mt-4">
          <div className="spinner-grow text-primary" role="status">
            <span className="sr-only">Loading... </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuthenticator(App);
