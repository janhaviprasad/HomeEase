import React from 'react'
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Booking from './pages/Booking'
import Providers from './pages/Providers'
import Services from './pages/Services'
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Help from './pages/Help';
import AdminLayouts from './layouts/AdminLayouts'


function App() {
  return (
    <BrowserRouter>
    <Routes>

      <Route
      path="/"
      element={<Login/>}
      />

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
        
      </Route>

    </Routes>
    </BrowserRouter>
  )
}

export default App