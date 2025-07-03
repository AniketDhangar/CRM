import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ApiTester from './components/ApiTester'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <ApiTester />
    </>
  )
}

export default App
