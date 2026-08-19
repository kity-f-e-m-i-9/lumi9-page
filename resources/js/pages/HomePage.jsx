import Hero from '../components/Hero';
import Features from '../components/Features';
import MothersComfort from '../components/MothersComfort';
import UltraSoftComfort from '../components/UltraSoftComfort';
import Collection from '../components/Collection';
import Testimonials from '../components/Testimonials';
import InstagramFeed from '../components/InstagramFeed';
import OfferModal from '../components/OfferModal';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <MothersComfort />
      <UltraSoftComfort />
      <Collection />
      <Testimonials />
      <InstagramFeed />
      <OfferModal />
    </>
  );
}
