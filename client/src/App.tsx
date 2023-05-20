import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const cookies = document.cookie;
  console.log(cookies);

  return (
    <>
      <h1>hello from React</h1>
      <p>count: {count}</p>
      <button onClick={() => setCount(count + 1)}>increment</button>

      <p>cookies: {cookies}</p>
    </>
  );
}

export default App;
