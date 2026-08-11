import { createBrowserRouter } from 'react-router'
import Root from './Root'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Studio from './pages/Studio'
import StudioColor from './pages/StudioColor'
import MyArt from './pages/MyArt'
import Ocean from './pages/Ocean'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'Account/Login', Component: Login },
      { path: 'Account/Register', Component: Register },
      { path: 'Studio', Component: Studio },
      { path: 'Studio/Color', Component: StudioColor },
      { path: 'Studio/MyArt', Component: MyArt },
      { path: 'Ocean', Component: Ocean },
    ],
  },
])
