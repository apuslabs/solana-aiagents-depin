import { createBrowserRouter } from 'react-router-dom';
import PlayGround from '../pages/playGround';
import Task from '../pages/task'

const routes = createBrowserRouter([
  {
    path: '/',
    element: <PlayGround />
  },
  {
    path: '/task',
    element: <Task />
  }

])

export default routes