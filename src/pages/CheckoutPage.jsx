import React from 'react';
import { Helmet } from 'react-helmet';

const CheckoutPage = () => {
  return (
    <>
      <Helmet>
        <title>Checkout - Agrivil</title>
        <meta name="description" content="Complete your purchase." />
      </Helmet>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold">Checkout</h1>
        <p className="text-lg text-gray-600 mt-4">Page under construction. Check back soon!</p>
      </div>
    </>
  );
};

export default CheckoutPage;