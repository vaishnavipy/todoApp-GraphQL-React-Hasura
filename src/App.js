
import './App.css';
import {useQuery,useLazyQuery,gql, useMutation } from "@apollo/client"
import { useState,useEffect } from 'react';

function App() {

  const [todo,setTodo] = useState("");

  const [todoArr,setTodoArr] = useState([]);

  const [checked,setChecked] = useState(false)

  const INSERT_TODO = gql`
  mutation insertTodo($title:String!,$user_id:String!) {
    insert_todos(objects: {title: $title, user_id:$user_id}) {
      affected_rows
    }
  }  
  `;

  const GET_TODO = gql`
  query get_todo {
    todos {
      id
      title
      is_completed
    }
  }
  `;

  const DELETE_TODO=gql`
  mutation delete_todos($id: Int!) {
    delete_todos(where: {id: {_eq:$id}}) {
      affected_rows
    }
  }`;

  const UPDATE_TODO = gql`
  
  mutation MyMutation($id:Int!,$is_completed:Boolean!) {
    update_todos(where: {id: {_eq: $id}}, _set: {is_completed: $is_completed}) {
      affected_rows
    }
  }
  
  `;

  const {loading:query_loading,error:query_err,data,refetch} = useQuery(GET_TODO)

  const [addtodo,{data:mutation_data,error:mutation_err,loading:mut_loading}] = useMutation(INSERT_TODO,{update:updateCache})

  const [deletetodo,{data:mutation_del_data,error:mutation_del_err,loading:mut_del_loading}] = useMutation(DELETE_TODO)

  const [updateTodo,{data:update_data}] = useMutation(UPDATE_TODO)

  
  function updateCache(cache,{data}){

    const exsisting_todos = cache.readQuery({query:GET_TODO});

    const new_todo = {title:todo,user_id:"1"}

    cache.writeQuery({
      query:GET_TODO,
      data : {todos: [...exsisting_todos.todos,new_todo]}
    })

  }
  

 
  
  function handleChange(e){
    setTodo(e.target.value)
  }

  function handleAdd(){
    addtodo({variables:{title:todo,user_id:"1"}})

   
    //refetch()
    if(!mutation_err){
      setTodo("")
    }
  
  }

  function clearAll(){
    
    todoArr.forEach(obj => {
      deletetodo({
        variables:{id:obj.id},
        optimisticResponse:true,
        update:(cache,{data})=>{
          var exsiting_data = cache.readQuery({query:GET_TODO})
      
        cache.writeQuery({
          query:GET_TODO,
          data:{todos:exsiting_data.todos.filter(obj2 => obj2.id !== obj.id) }
        })

        }
      })
    })
  }

  useEffect(()=>{

    if(data && data.todos){
        setTodoArr(data.todos)
       
      }

  },[data])

  function handleDelete(id){
    deletetodo({
      variables:{id:id},
      optimisticResponse:true,
      update:(cache,{data})=>{

        var exsiting_data = cache.readQuery({query:GET_TODO})
      
        cache.writeQuery({
          query:GET_TODO,
          data:{todos:exsiting_data.todos.filter(obj => obj.id !== id) }
        })


      }})
  }

  function handleChecked(id){
    setChecked(prevState => !prevState);

    updateTodo({variables:{id:id,is_completed:!checked},
      optimisticResponse:true,
      update:(cache,{data})=>{

        const exsisting_todos = cache.readQuery({query:GET_TODO});

        const modified_todo =exsisting_todos.todos.map(obj => {
          if(obj.id === id){
            return {...obj,is_completed: !obj.is_completed}
          }else{
            return obj
          }
        })

        cache.writeQuery({
          query:GET_TODO,
          data:{todos: modified_todo}
        })

      }
    })

  }

  return (
    <div className="container">
        <h1>To Do List</h1>
        <div><input type="text" name="todo" value={todo} onChange={handleChange}  /><button onClick={handleAdd}>Add This</button></div>

        {todoArr.map((todo) => 
        
        <div className="todo-flex">
          <input type="checkbox" defaultChecked={todo.is_completed} onChange={()=>{handleChecked(todo.id)}} />
          {todo.is_completed ? <p style={{textDecoration:"line-through",color:"red"}}>{todo.title}</p> : <p >{todo.title}</p>}
          <p  id={todo.id} className="delete" onClick={()=>{handleDelete(todo.id)}}>X</p></div>)
          }

        <div className="delete_all"><button onClick={clearAll}>CLEAR ALL</button></div>
    </div>
  );
}

export default App;
