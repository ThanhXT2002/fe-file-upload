"use client"

import './assets/styles/main.module.scss'
import './app.css'
import 'react-toastify/dist/ReactToastify.css'
import { Outlet } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/auth'

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </AuthProvider>
  )
}
