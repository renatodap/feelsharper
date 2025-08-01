import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  image?: string
  url?: string
}



export default function Layout({ 
  children, 
  title, 
  description, 
  image, 
  url 
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
