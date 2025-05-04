import MainLayout from "../components/layout/MainLayout"
import Hero from "../components/home/Hero"
import SearchForm from "../components/home/SearchForm"
import Features from "../components/home/Features"
import Doctors from "../components/home/Doctors"
import Diagnostic from "../components/home/Diagnostic"
import "../styles/globals.css"

const HomePage = () => {
  return (
    <MainLayout>
      <Hero />
      <SearchForm />
      <Features />
      <Doctors />
      <Diagnostic />
    </MainLayout>
  )
}

export default HomePage
