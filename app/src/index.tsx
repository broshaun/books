import { render } from 'solid-js/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'
import { routeTree } from './routeTree.gen'
import './index.css';


const router = createRouter({ routeTree })
function App() {
  return <RouterProvider router={router} />
}

render(() => <App />, document.getElementById('root')!)