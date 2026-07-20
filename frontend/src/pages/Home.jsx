import React from 'react';
import HeroSection from '../components/HeroSection';
import FeatureGrid from '../components/FeatureGrid';
import CallToAction from '../components/CallToAction';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <CallToAction />
    </>
  );
}
