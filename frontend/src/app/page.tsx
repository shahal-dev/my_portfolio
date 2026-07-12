import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeContent from '@/components/HomeContent';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative flex-grow flex flex-col">
        <Navbar light />
        <HomeContent />
      </div>
      <Footer />
    </main>
  );
}
