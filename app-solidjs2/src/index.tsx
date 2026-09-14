import { render } from '@solidjs/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'
import { routeTree } from './routeTree.gen'


const router = createRouter({ routeTree })
function App() {
  return <RouterProvider router={router} />
}

render(() => <App />, document.getElementById('root')!)