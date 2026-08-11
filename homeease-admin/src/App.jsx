import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Booking from './pages/Booking'
import Providers from './pages/Providers'
import Earnings from './pages/Earnings'
import Users from './pages/Users'
import Services from './pages/Services'
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import AdminLayouts from './layouts/AdminLayouts'
import ProtectedRoute from './routes/ProtectedRoute'


function App() {
  return (
    <BrowserRouter>
    <Routes>

      <Route
      path="/"
      element={<Login/>}
      />

      <Route element={<ProtectedRoute/>}>
      <Route element={<AdminLayouts/>}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/providers"
          element={<Providers />}
        />

        <Route
          path="/earnings"
          element={<Earnings />}
        />

        <Route
          path="/users"
          element={<Users />}
        />

        <Route
          path="/booking"
          element={<Booking />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
         path="/settings"
         element={<Settings />}
/>
         <Route
         path="/profile"
         element={<Profile />}
/>
<Route
  path="/help"
  element={<Help />}
/>

        {/* Catch-all sits inside the guard, so an unknown URL still redirects
            to login when signed out, and keeps the sidebar when signed in. */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Route>
      </Route>

    </Routes>
    </BrowserRouter>
  )
}

export default App