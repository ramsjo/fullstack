import { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetch('https://fullstackbackend-h71l.onrender.com/api/todos')
      .then(res => res.json())
      .then(setTodos);
  }, []);

  const addTodo = () => {
    fetch('https://fullstackbackend-h71l.onrender.com/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then(() => window.location.reload());
  };

  return (
    <div>
      <h1>My Todos</h1>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((t, i) => <li key={i}>{t.text}</li>)}
      </ul>
    </div>
  );
}
export default App;
