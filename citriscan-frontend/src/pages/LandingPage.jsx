import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import UseCases from '../components/UseCases';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <UseCases />
      </main>
      <Footer />
    </>
  );
}
