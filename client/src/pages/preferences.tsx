import { useState } from 'react';

export default function Preferences() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>hello from React</h1>
      <button onClick={() => setCount(count + 1)}>increment</button>
    </>
  );
}
