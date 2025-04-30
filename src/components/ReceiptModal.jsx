import React, { useState } from 'react';

const ReceiptModal = ({ show, bike, onClose, onPay }) => {
  const [step, setStep] = useState('receipt'); // 'receipt' | 'payment' | 'success'
  const [cardNumber, setCardNumber] = useState('');

  if (!show || !bike) return null;

  const handlePayNow = () => setStep('payment');
  const handlePayment = (e) => {
    e.preventDefault();
    if (cardNumber.length < 8) return; // simple validation
    setStep('success');
    setTimeout(() => {
      onPay();
      onClose();
      setStep('receipt');
      setCardNumber('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        {step === 'receipt' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Rental Receipt</h2>
            <div className="mb-2"><strong>Bike:</strong> {bike.name}</div>
            <div className="mb-2"><strong>Type:</strong> {bike.type}</div>
            <div className="mb-2"><strong>Hourly Rate:</strong> ${bike.pricePerHour}</div>
            <div className="mb-2"><strong>Daily Rate:</strong> ${bike.pricePerDay}</div>
            <div className="mb-2"><strong>Status:</strong> {bike.available ? 'Available' : 'Rented Out'}</div>
            <button className="btn btn-primary w-full mt-4" onClick={handlePayNow}>Pay Now</button>
          </>
        )}
        {step === 'payment' && (
          <form onSubmit={handlePayment} className="space-y-4">
            <h3 className="text-xl font-semibold mb-2">Enter Card Details</h3>
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              minLength={8}
            />
            <button type="submit" className="btn btn-primary w-full">Pay</button>
          </form>
        )}
        {step === 'success' && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-600 mb-4">Bike rented successfully!</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptModal;
