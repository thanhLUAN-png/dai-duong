import { Outlet } from 'react-router'
import Layout from './components/Layout'
import { AppProvider } from './context/AppContext'

export default function Root() {
  return (
    <AppProvider>
      <Layout>
        <Outlet />
      </Layout>
    </AppProvider>
  )
}
