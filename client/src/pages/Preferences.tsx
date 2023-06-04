import { useState } from 'react';

export default function Preferences() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>hello from React</h1>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <p>count: {count}</p>
      <button onClick={() => setCount(count + 1)}>increment</button>
    </>
  );
}
