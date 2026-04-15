
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './App.css'

function App() {
  const router = createBrowserRouter([
    {
      path:'/login',


    },
    {
      path:'/register',
    }
  ])

  return (
    <>
     <RouterProvider router={router}>
     </RouterProvider>
    </>
  )
}

export default App
