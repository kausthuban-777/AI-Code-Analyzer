import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Welcome to AI Code Analyzer</div>} />
      </Routes>
    </BrowserRouter>
  )
}
