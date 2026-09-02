'use client';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is your delivery time?',
    answer: 'Standard delivery takes 7-15 working days depending on the product and your location. Custom furniture may take 15-30 days. We provide delivery across Mumbai, Navi Mumbai and Thane (and Ahmedabad projects via our Bopal branch).',
  },
  {
    question: 'Do you offer warranty on furniture?',
    answer: 'Yes! All our furniture comes with a 5-year warranty covering manufacturing defects. We also offer warranty on wood and hardware for peace of mind.',
  },
  {
    question: 'Can I customize my furniture?',
    answer: 'Absolutely! We specialize in custom furniture design. You can choose the size, material, color, and design as per your requirements. Contact us for a free consultation.',
  },
  {
    question: 'Do you provide installation service?',
    answer: 'Yes, we provide free professional installation for all our products. Our team will deliver and install your furniture at your preferred time.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery, UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Bank Transfers. EMI options are also available.',
  },
  {
    question: 'Do you have a return policy?',
    answer: 'We offer a 7-day replacement policy for damaged or defective products. Custom-made furniture is non-refundable but we ensure 100% quality assurance.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq" id="faq">
      <h1 className="heading">Frequently Asked <span>Questions</span></h1>
      <div className="faq-container">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className={`faq-item${activeIndex === index ? ' active' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
