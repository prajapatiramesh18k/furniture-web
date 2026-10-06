'use client';

import { useState } from 'react';
import { PHONES } from '@/lib/site-config';

const WHATSAPP_NUMBER = PHONES.whatsappPrimary.e164;
const CALL_NUMBER = PHONES.mumbaiPrimary.tel;

const jobs = [
  {
    id: 'senior-carpenter',
    badge: 'Urgent Hiring — 2 Posts',
    icon: 'fa-hammer',
    title: 'Senior Carpenter',
    hindi: 'सीनियर मिस्त्री / एक्सपर्ट कारीगर',
    salary: '₹30,000 – ₹40,000 / month',
    salaryNote: '+ overtime • skill ke hisaab se salary badhegi',
    experience: '5+ saal ka experience',
    type: 'Full-time • Factory + Site work',
    location: 'Thane (Khardipada) • Mumbai / Thane site',
    points: [
      'Modular kitchen, wardrobe, bed, TV unit — expert finishing ke saath',
      'Plywood / HD-HMR / laminate / acrylic ka full kaam',
      'Drawing / design padh kar khud kaam plan kar sake',
      'Junior team ko guide kar sake, site sambhal sake',
      'Power tools aur machine ka expert use',
    ],
  },
  {
    id: 'carpenter',
    badge: 'Urgent Hiring — 4 Posts',
    icon: 'fa-screwdriver-wrench',
    title: 'Carpenter',
    hindi: 'फर्नीचर मिस्त्री / बढ़ई',
    salary: '₹25,000 – ₹35,000 / month',
    salaryNote: '+ overtime • skill ke hisaab se salary badhegi',
    experience: '3+ saal ka experience',
    type: 'Full-time • Factory + Site work',
    location: 'Thane (Khardipada) • Mumbai / Thane site',
    points: [
      'Modular kitchen, wardrobe, bed, TV unit banana aata ho',
      'Plywood / HD-HMR / laminate / acrylic ka kaam',
      'Measurement, cutting, fitting — finishing ke saath',
      'Power tools (router, cutting machine, drill) chalana aata ho',
      'Drawing / design samajh kar kaam kar sake',
    ],
  },
  {
    id: 'junior-carpenter',
    badge: 'Hiring — 3 Posts',
    icon: 'fa-toolbox',
    title: 'Junior Carpenter',
    hindi: 'जूनियर मिस्त्री / सहायक मिस्त्री',
    salary: '₹18,000 – ₹25,000 / month',
    salaryNote: '+ overtime • kaam seekhne par salary badhegi',
    experience: '1–2 saal ka experience',
    type: 'Full-time • Factory + Site work',
    location: 'Thane (Khardipada) • Mumbai / Thane site',
    points: [
      'Senior / Carpenter ke saath milkar furniture banana',
      'Cutting, pasting, fitting me support aur finishing seekhna',
      'Basic power tools chalana aata ho',
      'Measurement aur drawing samajhna seekhne ki ichha ho',
      'Time par aaye, mehnati ho, jaldi seekhe',
    ],
  },
  {
    id: 'helper',
    badge: 'Fresher Welcome — 6 Posts',
    icon: 'fa-people-carry-box',
    title: 'Carpenter Helper',
    hindi: 'हेल्पर / सहायक कारीगर',
    salary: '₹12,000 – ₹18,000 / month',
    salaryNote: '+ overtime • kaam seekhne par salary badhegi',
    experience: 'No experience needed — fresher chalega',
    type: 'Full-time • Factory + Site work',
    location: 'Thane (Khardipada) • Mumbai / Thane site',
    points: [
      'Mistri ke saath kaam me help karna',
      'Samaan uthana-rakhna, site/factory safai',
      'Cutting, pasting, packing me support',
      'Mehnati ho, time par aaye, seekhne ki ichha ho',
      '18 saal se upar, Mumbai/Thane me rehne wala (ya rehne ko ready)',
    ],
  },
];

const benefits = [
  { icon: 'fa-money-bill-wave', title: 'Time par Payment', text: 'Mahine ki salary / hapta — time par, bina atak ke.' },
  { icon: 'fa-clock', title: 'Overtime Milega', text: 'Extra kaam ka extra paisa. Jitna kaam, utni kamai.' },
  { icon: 'fa-briefcase', title: 'Saal Bhar Kaam', text: 'Season ka tension nahi — factory + site, regular kaam.' },
  { icon: 'fa-screwdriver-wrench', title: 'Tools Hum Denge', text: 'Machine aur tools company ke. Aap sirf skill laao.' },
  { icon: 'fa-house-chimney', title: 'Rehne me Help', text: 'Bahar se aane walo ke liye room dhoondhne me madad.' },
  { icon: 'fa-arrow-trend-up', title: 'Salary Growth', text: 'Achha kaam → jaldi increment. Helper bhi Mistri ban sakta hai.' },
];

const steps = [
  { n: '1', title: 'Form bharo / Call karo', text: 'Neeche form bharo ya seedha call / WhatsApp karo.' },
  { n: '2', title: 'Factory par trial', text: 'Thane factory aao — 1 din ka trial / skill check.' },
  { n: '3', title: 'Turant joining', text: 'Salary fix → turant kaam shuru. Advance pe baat ho sakti hai.' },
];

const faqs = [
  {
    q: 'Salary kab aur kaise milegi?',
    a: 'Mahine ki 5–7 tarikh tak salary clear. Chaaho to weekly hisaab bhi ho sakta hai. Overtime alag se milta hai.',
  },
  {
    q: 'Kya rehne ki jagah milegi?',
    a: 'Company room nahi deti, lekin aas-paas sasta room dhoondhne me poori madad karegi. Bahut se ladke paas me hi rehte hain.',
  },
  {
    q: 'Carpenter Helper ko kya kaam karna hoga? Experience chahiye?',
    a: 'Nahi, Carpenter Helper ke liye koi experience nahi chahiye. Senior / Carpenter ke saath rehkar kaam seekhna hai — mehnat aur time-par-aana sabse important hai.',
  },
  {
    q: 'Senior Carpenter / Carpenter ke liye trial hota hai?',
    a: 'Haan, 1 din ka trial hota hai factory ya site par — taaki aapki skill ke hisaab se sahi salary fix ho sake.',
  },
  {
    q: 'Kaam kahan hoga — factory ya site?',
    a: 'Dono. Thane (Khardipada) factory + Mumbai / Thane / Navi Mumbai ki sites. Kaam company ki taraf se conveyance/plan ke saath hota hai.',
  },
];

const initialForm = {
  name: '',
  phone: '',
  post: 'carpenter',
  experience: '',
  currentLocation: '',
  expectedSalary: '',
  message: '',
};

const postLabels: Record<string, string> = {
  'senior-carpenter': 'Senior Carpenter',
  carpenter: 'Carpenter',
  'junior-carpenter': 'Junior Carpenter',
  helper: 'Carpenter Helper',
};

export default function CareersPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const set = (key: keyof typeof initialForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const sanitizePhone = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits.slice(0, 10);
  };

  const scrollToForm = () => {
    document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJobApply = (jobId: string) => {
    set('post', jobId);
    scrollToForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Apna naam likho.');
      return;
    }
    const phoneDigits = sanitizePhone(form.phone);
    if (phoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      setError('Sahi 10-digit mobile number likho (bina +91).');
      return;
    }
    if (!form.post) {
      setError('Kaunsi post ke liye apply kar rahe ho — post select karo?');
      return;
    }

    setSubmitting(true);
    try {
      const postLabel = postLabels[form.post] || 'Carpenter';
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: phoneDigits,
          email: `${phoneDigits}@job.ananya.local`,
          address: form.currentLocation.trim(),
          projectType: 'job-application',
          branch: 'mumbai',
          source: 'careers-page',
          message: `[JOB APPLICATION — ${postLabel}]\nExperience: ${form.experience.trim() || '—'}\nCurrent location: ${form.currentLocation.trim() || '—'}\nExpected salary: ${form.expectedSalary.trim() || '—'}\nNote: ${form.message.trim() || '—'}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error((data as { error?: string } | null)?.error || 'Submit nahi ho paya.');
      }
      // Also open WhatsApp so the owner gets the application instantly
      const expValue = form.experience.trim() || '—';
      const locValue = form.currentLocation.trim() || '—';
      const salValue = form.expectedSalary.trim() ? `₹${form.expectedSalary.trim()}` : '—';
      const skillValue = form.message.trim() || '—';
      const text = encodeURIComponent(
        `Hello Sir/Madam,\nMujhe aapki company me ${postLabel} ki job me interest hai. Main ${postLabel} hoon aur mujhe ${expValue} ka experience hai.\nMain filhaal ${locValue} me rehta hoon aur meri expected salary ${salValue} hai.\n\nMeri details neeche hain:\nName: ${form.name.trim()}\nMobile Number: ${phoneDigits}\nPost: ${postLabel}\nExperience: ${expValue}\nExpected Salary: ${salValue}\nCurrent Location: ${locValue}\nWork Experience/Skills: ${skillValue}\n\nAgar aapki company me ${postLabel} ki suitable vacancy available hai, to please mujhe job ke regarding further details batayein. Main required process aur interview ke liye available hoon.\nDhanyavaad!`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kuch galat ho gaya. Call / WhatsApp par apply karo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="careers-page">
      <style>{`
        .careers-page { background: #faf7f1; color: #222; font-size: 1.5rem; }
        .careers-hero {
          background: linear-gradient(135deg, #1f232a 0%, #3a2c17 60%, #a27341 100%);
          color: #fff; padding: 6rem 1.5rem 4rem; text-align: center; position: relative; overflow: hidden;
        }
        .careers-hero::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 80% 20%, rgba(206,150,46,.35), transparent 50%);
          pointer-events: none;
        }
        .careers-hero-inner { max-width: 860px; margin: 0 auto; position: relative; z-index: 1; }
        .hiring-pill {
          display: inline-flex; align-items: center; gap: .6rem; background: #25d366; color: #0c2b16;
          font-weight: 700; font-size: 1.3rem; padding: .6rem 1.6rem; border-radius: 999px;
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.4rem;
        }
        .hiring-pill .dot { width: 9px; height: 9px; border-radius: 50%; background: #0c2b16; animation: blink 1.2s infinite; }
        @keyframes blink { 50% { opacity: .25; } }
        .careers-hero h1 { font-size: clamp(2.6rem, 5vw, 4.4rem); font-weight: 700; line-height: 1.2; margin: 0 0 1rem; text-transform: none; }
        .careers-hero h1 span { color: #e9b949; }
        .careers-hero p.sub { font-size: 1.7rem; color: #f0e6d3; margin: 0 auto 2rem; max-width: 640px; text-transform: none; }
        .hero-cta-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-call, .btn-wa, .btn-apply {
          display: inline-flex; align-items: center; gap: .7rem; font-size: 1.6rem; font-weight: 600;
          padding: 1.2rem 2.4rem; border-radius: 12px; cursor: pointer; border: none; text-decoration: none;
        }
        .btn-call { background: #e9b949; color: #1f232a; }
        .btn-call:hover { background: #f5c95e; }
        .btn-wa { background: #25d366; color: #fff; }
        .btn-wa:hover { background: #1fb857; }
        .btn-apply { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.6); }
        .btn-apply:hover { border-color: #fff; background: rgba(255,255,255,.1); }
        .hero-meta { margin-top: 1.8rem; display: flex; gap: .8rem; justify-content: center; flex-wrap: wrap; font-size: 1.35rem; color: #e8dcc4; }
        .hero-meta span { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); padding: .5rem 1.2rem; border-radius: 999px; }
        .careers-section { max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem; }
        .sec-eyebrow { color: #a27341; font-weight: 700; font-size: 1.3rem; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 .6rem; text-align: center; }
        .sec-title { text-align: center; font-size: clamp(2.2rem, 4vw, 3.2rem); margin: 0 0 .8rem; text-transform: none; }
        .sec-sub { text-align: center; color: #666; max-width: 640px; margin: 0 auto 2.5rem; text-transform: none; }
        .jobs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        @media (max-width: 820px) { .jobs-grid { grid-template-columns: 1fr; } }
        .job-card {
          background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.08);
          border: 1px solid #eee0cb; display: flex; flex-direction: column;
        }
        .job-card-head { background: #1f232a; color: #fff; padding: 2rem; position: relative; }
        .job-card-head.helper { background: linear-gradient(135deg, #7a5a28, #a27341); }
        .job-badge { display: inline-block; background: #e9b949; color: #1f232a; font-size: 1.2rem; font-weight: 700; padding: .4rem 1.1rem; border-radius: 999px; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: .5px; }
        .job-card-head h3 { font-size: 2.4rem; margin: 0; }
        .job-card-head .hindi { color: #e9b949; font-size: 1.6rem; margin-top: .3rem; display: block; }
        .job-card-head.helper .hindi { color: #ffe9bd; }
        .job-salary { margin-top: 1.2rem; background: rgba(255,255,255,.1); border-radius: 10px; padding: 1rem 1.2rem; }
        .job-salary strong { font-size: 1.8rem; color: #fff; display: block; }
        .job-salary small { color: #e8dcc4; font-size: 1.25rem; }
        .job-body { padding: 2rem; flex: 1; display: flex; flex-direction: column; }
        .job-meta-row { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.4rem; font-size: 1.35rem; color: #555; }
        .job-meta-row i { color: #a27341; width: 20px; }
        .job-body ul { list-style: none; margin: 0 0 2rem; padding: 0; display: grid; gap: .8rem; }
        .job-body ul li { display: flex; gap: .8rem; font-size: 1.4rem; color: #333; text-transform: none; }
        .job-body ul li i { color: #2e9e5b; margin-top: 4px; }
        .job-apply-btn {
          margin-top: auto; width: 100%; background: #1f232a; color: #fff; font-size: 1.6rem; font-weight: 600;
          padding: 1.2rem; border-radius: 12px; border: none; cursor: pointer;
        }
        .job-apply-btn:hover { background: #a27341; }
        .job-apply-btn.helper-btn { background: #a27341; }
        .job-apply-btn.helper-btn:hover { background: #8a6136; }
        .benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        @media (max-width: 820px) { .benefits-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .benefits-grid { grid-template-columns: 1fr; } }
        .benefit-card { background: #fff; border: 1px solid #eee0cb; border-radius: 14px; padding: 1.8rem; text-align: center; }
        .benefit-card i { font-size: 2.6rem; color: #a27341; margin-bottom: .8rem; }
        .benefit-card h4 { font-size: 1.6rem; margin: 0 0 .4rem; }
        .benefit-card p { font-size: 1.35rem; color: #666; margin: 0; text-transform: none; }
        .steps-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        @media (max-width: 720px) { .steps-row { grid-template-columns: 1fr; } }
        .step-card { background: #1f232a; color: #fff; border-radius: 14px; padding: 2rem; text-align: center; }
        .step-num { width: 46px; height: 46px; border-radius: 50%; background: #e9b949; color: #1f232a; font-weight: 800; font-size: 1.8rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .step-card h4 { font-size: 1.7rem; margin: 0 0 .5rem; }
        .step-card p { color: #cfc6b4; font-size: 1.35rem; margin: 0; text-transform: none; }
        .apply-wrap { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; align-items: start; }
        @media (max-width: 860px) { .apply-wrap { grid-template-columns: 1fr; } }
        .apply-side { background: #1f232a; color: #fff; border-radius: 18px; padding: 2.5rem; position: sticky; top: 9rem; }
        @media (max-width: 860px) { .apply-side { position: static; } }
        .apply-side h3 { font-size: 2.2rem; margin: 0 0 .6rem; text-transform: none; }
        .apply-side p { color: #cfc6b4; font-size: 1.4rem; margin: 0 0 1.5rem; text-transform: none; }
        .side-contact { display: grid; gap: 1rem; }
        .side-contact a { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: #fff; padding: 1.2rem 1.4rem; border-radius: 12px; font-size: 1.5rem; text-decoration: none; }
        .side-contact a:hover { background: rgba(255,255,255,.15); }
        .side-contact a i { font-size: 2rem; color: #e9b949; }
        .side-contact a.wa i { color: #25d366; }
        .side-contact small { display: block; color: #a79d88; font-size: 1.2rem; }
        .apply-form-card { background: #fff; border-radius: 18px; border: 1px solid #eee0cb; padding: 2.5rem; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
        .apply-form-card h3 { font-size: 2.2rem; margin: 0 0 .4rem; text-transform: none; }
        .apply-form-card > p { color: #666; font-size: 1.35rem; margin: 0 0 2rem; text-transform: none; }
        .f-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
        @media (max-width: 560px) { .f-grid { grid-template-columns: 1fr; } }
        .f-field { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.2rem; }
        .f-field.full { grid-column: 1 / -1; }
        .f-field label { font-size: 1.3rem; font-weight: 600; color: #444; }
        .f-field input, .f-field select, .f-field textarea {
          font-size: 1.5rem; padding: 1.1rem 1.3rem; border: 1.5px solid #ddd; border-radius: 10px; background: #fff;
          width: 100%; text-transform: none;
        }
        .f-field input:focus, .f-field select:focus, .f-field textarea:focus { border-color: #a27341; box-shadow: 0 0 0 3px rgba(162,115,65,.15); }
        .phone-wrap { display: flex; align-items: stretch; }
        .phone-wrap .prefix { background: #f3ede1; border: 1.5px solid #ddd; border-right: none; border-radius: 10px 0 0 10px; padding: 0 1.2rem; display: flex; align-items: center; font-size: 1.5rem; font-weight: 600; color: #555; }
        .phone-wrap input { border-radius: 0 10px 10px 0 !important; }
        .post-pick { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .post-opt { border: 2px solid #ddd; border-radius: 12px; padding: 1.2rem; text-align: center; cursor: pointer; font-weight: 600; font-size: 1.4rem; background: #fff; }
        .post-opt small { display: block; font-weight: 400; color: #888; font-size: 1.2rem; margin-top: .2rem; }
        .post-opt.active { border-color: #a27341; background: #faf3e6; color: #7a5a28; }
        .form-error { background: #fdecea; color: #b3261e; border: 1px solid #f5c6c2; padding: 1rem 1.3rem; border-radius: 10px; font-size: 1.35rem; margin-bottom: 1.2rem; text-transform: none; }
        .submit-btn { width: 100%; background: #25d366; color: #fff; font-size: 1.7rem; font-weight: 700; padding: 1.3rem; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .8rem; }
        .submit-btn:hover:not(:disabled) { background: #1fb857; }
        .submit-btn:disabled { opacity: .7; cursor: wait; }
        .secure-note { text-align: center; color: #999; font-size: 1.25rem; margin-top: 1rem; }
        .success-box { text-align: center; padding: 2rem 1rem; }
        .success-circle { width: 84px; height: 84px; border-radius: 50%; background: #e7f7ee; color: #2e9e5b; font-size: 3.6rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; }
        .success-box h3 { font-size: 2.4rem; margin: 0 0 .6rem; }
        .success-box p { color: #555; font-size: 1.45rem; text-transform: none; }
        .faq-list { display: grid; gap: 1rem; max-width: 800px; margin: 0 auto; }
        .faq-item { background: #fff; border: 1px solid #eee0cb; border-radius: 12px; overflow: hidden; }
        .faq-q { width: 100%; background: none; border: none; text-align: left; font-size: 1.55rem; font-weight: 600; padding: 1.5rem 1.8rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 1rem; text-transform: none; color: #222; }
        .faq-a { padding: 0 1.8rem 1.6rem; color: #555; font-size: 1.4rem; text-transform: none; }
        .job-wa-btn { display: flex; align-items: center; justify-content: center; gap: .7rem; margin-top: .9rem; background: #e7f7ee; color: #146c43; border: 2px solid #25d366; border-radius: 12px; padding: 1.1rem; font-size: 1.5rem; font-weight: 700; text-decoration: none; }
        .job-wa-btn:hover { background: #d6f2e2; }
        .bottom-cta { background: linear-gradient(135deg, #1f232a, #4a3618); border-radius: 20px; color: #fff; text-align: center; padding: 3.5rem 2rem; }
        .bottom-cta h2 { font-size: clamp(2rem, 4vw, 3rem); margin: 0 0 .8rem; text-transform: none; }
        .bottom-cta h2 span { color: #e9b949; }
        .bottom-cta p { color: #d8cdb6; margin: 0 0 2rem; font-size: 1.5rem; text-transform: none; }
      `}</style>

      {/* HERO */}
      <section className="careers-hero">
        <div className="careers-hero-inner">
          <span className="hiring-pill"><span className="dot" /> Hiring Now — भर्ती चालू है</span>
          <h1>Senior Carpenter, Carpenter &amp; <span>Helper</span> Chahiye</h1>
          <p className="sub">Ananya House of Furniture — Thane / Mumbai. Regular kaam, time par payment, overtime ke saath. Aaj hi apply karo, kal se kaam shuru karo.</p>
          <div className="hero-cta-row">
            <a className="btn-call" href={`tel:${CALL_NUMBER}`}><i className="fas fa-phone" /> Call Karo</a>
            <a className="btn-wa" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Namaste! Maine aapki carpenter ki job dekhi hai (Senior / Carpenter / Junior / Helper). Mujhe apply karna hai, niche meri details de di hai.\nNaam: \nMobile: \nExperience: ')}`} target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp" /> WhatsApp Par Apply</a>
            <button className="btn-apply" onClick={scrollToForm} type="button">Form Bharo</button>
          </div>
          <div className="hero-meta">
            <span><i className="fas fa-location-dot" /> Thane • Mumbai • Navi Mumbai</span>
            <span><i className="fas fa-briefcase" /> Full-time • Factory + Site</span>
            <span><i className="fas fa-indian-rupee-sign" /> Overtime + Growth</span>
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="careers-section">
        <p className="sec-eyebrow">Open Positions — खाली पोस्ट</p>
        <h2 className="sec-title">4 Post Khali Hain — Apne Liye Sahi Kaam Chuno</h2>
        <p className="sec-sub">Chaaro post ke liye turant joining. Neeche details padho aur seedha apply karo.</p>
        <div className="jobs-grid">
          {jobs.map((job) => (
            <article key={job.id} className="job-card">
              <div className={`job-card-head ${job.id === 'junior-carpenter' || job.id === 'helper' ? 'helper' : ''}`}>
                <span className="job-badge">{job.badge}</span>
                <h3><i className={`fas ${job.icon}`} style={{ marginRight: '.6rem' }} />{job.title}</h3>
                <span className="hindi">{job.hindi}</span>
                <div className="job-salary">
                  <strong>{job.salary}</strong>
                  <small>{job.salaryNote}</small>
                </div>
              </div>
              <div className="job-body">
                <div className="job-meta-row">
                  <span><i className="fas fa-award" /> {job.experience}</span>
                  <span><i className="fas fa-clock" /> {job.type}</span>
                  <span><i className="fas fa-location-dot" /> {job.location}</span>
                </div>
                <ul>
                  {job.points.map((p) => (
                    <li key={p}><i className="fas fa-circle-check" />{p}</li>
                  ))}
                </ul>
                <button type="button" className={`job-apply-btn ${job.id === 'junior-carpenter' || job.id === 'helper' ? 'helper-btn' : ''}`} onClick={() => handleJobApply(job.id)}>
                  {job.title} Ke Liye Apply Karo <i className="fas fa-arrow-right" />
                </button>
                <a
                  className="job-wa-btn"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Namaste! Maine ${job.title} ki job ke liye apply kiya hai. Niche maine apni details daal di hai, aap check karke mujhe batayie.\nNaam: \nMobile: \nExperience: `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp" /> WhatsApp Par Seedha Apply
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="careers-section" style={{ paddingTop: 0 }}>
        <p className="sec-eyebrow">Humare Saath Kyun Kaam Karo?</p>
        <h2 className="sec-title">Chaaro Post Ke Liye Fayde</h2>
        <p className="sec-sub">2012 se chal rahi company — kaam kabhi rukta nahi, payment kabhi atakti nahi.</p>
        <div className="benefits-grid">
          {benefits.map((b) => (
            <div key={b.title} className="benefit-card">
              <i className={`fas ${b.icon}`} />
              <h4>{b.title}</h4>
              <p>{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="careers-section" style={{ paddingTop: 0 }}>
        <p className="sec-eyebrow">Joining Process</p>
        <h2 className="sec-title">3 Step Me Joining — Koi Lamba Process Nahi</h2>
        <p className="sec-sub">Apply se lekar joining tak — sab 2-3 din me.</p>
        <div className="steps-row">
          {steps.map((s) => (
            <div key={s.n} className="step-card">
              <span className="step-num">{s.n}</span>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APPLY */}
      <section className="careers-section" id="apply-form" style={{ paddingTop: 0 }}>
        <p className="sec-eyebrow">Apply Karo — अप्लाई करो</p>
        <h2 className="sec-title">2 Minute Ka Form — Hum Khud Call Karenge</h2>
        <p className="sec-sub">Form bharte hi WhatsApp bhi khul jayega — ek click me application hum tak pahunch jayegi.</p>
        <div className="apply-wrap">
          <aside className="apply-side">
            <h3>Call / WhatsApp par turant baat karo</h3>
            <p>Form nahi bharna? Koi baat nahi — seedha call ya WhatsApp karo. Hindi me baat karo, koi problem nahi.</p>
            <div className="side-contact">
              <a href={`tel:${CALL_NUMBER}`}>
                <i className="fas fa-phone" />
                <span>{PHONES.mumbaiPrimary.display}<small>Tap karke call karo • subah 9 – raat 9</small></span>
              </a>
              <a className="wa" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Namaste! Maine aapki carpenter ki job dekhi hai. Mujhe apply karna hai.\nNaam: \nPost (Senior / Carpenter / Junior / Helper): \nMobile: \nExperience: ')}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp" />
                <span>WhatsApp karo<small>Naam + post likh kar bhejo</small></span>
              </a>
              <a href="https://maps.app.goo.gl/3wAw79stEiGNyeWa9" target="_blank" rel="noopener noreferrer">
                <i className="fas fa-location-dot" />
                <span>Factory: Khardipada, Thane<small>Diva-Shil Road — direction dekho</small></span>
              </a>
            </div>
          </aside>

          <div className="apply-form-card">
            {submitted ? (
              <div className="success-box">
                <span className="success-circle"><i className="fas fa-check" /></span>
                <h3>Application Mil Gayi! ✅</h3>
                <p>Dhanyavaad {form.name.split(' ')[0]}! Hum 24 ghante ke andar call karenge. Jaldi joining chahiye to upar diye number par WhatsApp kar do.</p>
                <button type="button" className="submit-btn" style={{ background: '#1f232a', marginTop: '1.5rem' }} onClick={() => { setSubmitted(false); setForm(initialForm); }}>
                  Ek Aur Application Bhejo
                </button>
              </div>
            ) : (
              <>
                <h3>Job Application Form</h3>
                <p>Sirf naam aur mobile zaroori hai — baaki jo pata ho bhar do.</p>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="f-field full">
                    <label>Kaunsi post? *</label>
                    <div className="post-pick">
                      <button type="button" className={`post-opt ${form.post === 'senior-carpenter' ? 'active' : ''}`} onClick={() => set('post', 'senior-carpenter')}>
                        ⭐ Senior Carpenter<small>5+ saal experience</small>
                      </button>
                      <button type="button" className={`post-opt ${form.post === 'carpenter' ? 'active' : ''}`} onClick={() => set('post', 'carpenter')}>
                        🔨 Carpenter<small>3+ saal experience</small>
                      </button>
                      <button type="button" className={`post-opt ${form.post === 'junior-carpenter' ? 'active' : ''}`} onClick={() => set('post', 'junior-carpenter')}>
                        🛠️ Junior Carpenter<small>1–2 saal experience</small>
                      </button>
                      <button type="button" className={`post-opt ${form.post === 'helper' ? 'active' : ''}`} onClick={() => set('post', 'helper')}>
                        💪 Carpenter Helper<small>Fresher chalega</small>
                      </button>
                    </div>
                  </div>
                  <div className="f-grid">
                    <div className="f-field">
                      <label htmlFor="job-name">Aapka Naam *</label>
                      <input id="job-name" type="text" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
                    </div>
                    <div className="f-field">
                      <label htmlFor="job-phone">Mobile Number *</label>
                      <div className="phone-wrap">
                        <span className="prefix">+91</span>
                        <input id="job-phone" type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210" value={form.phone} onChange={(e) => set('phone', sanitizePhone(e.target.value))} autoComplete="tel" />
                      </div>
                    </div>
                  </div>
                  <div className="f-grid">
                    <div className="f-field">
                      <label htmlFor="job-exp">Experience (saal me)</label>
                      <select id="job-exp" value={form.experience} onChange={(e) => set('experience', e.target.value)}>
                        <option value="">Select karo</option>
                        <option value="Fresher — koi experience nahi">Fresher — koi experience nahi</option>
                        <option value="1-2 saal">1–2 saal</option>
                        <option value="3-5 saal">3–5 saal</option>
                        <option value="5-10 saal">5–10 saal</option>
                        <option value="10+ saal">10+ saal</option>
                      </select>
                    </div>
                    <div className="f-field">
                      <label htmlFor="job-salary">Expected Salary (per month)</label>
                      <input id="job-salary" type="text" inputMode="numeric" placeholder="e.g. 20000" value={form.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value.replace(/[^\d]/g, '').slice(0, 6))} />
                    </div>
                  </div>
                  <div className="f-field full">
                    <label htmlFor="job-location">Abhi Kahan Rehte Ho?</label>
                    <input id="job-location" type="text" placeholder="e.g. Diva, Thane / UP / Bihar se aaye ho?" value={form.currentLocation} onChange={(e) => set('currentLocation', e.target.value)} />
                  </div>
                  <div className="f-field full">
                    <label htmlFor="job-msg">Kuch Aur Batana Ho? (optional)</label>
                    <textarea id="job-msg" rows={3} placeholder="e.g. Kitchen ka kaam aata hai, pichle 4 saal se Mumbai me kaam kar raha hun…" value={form.message} onChange={(e) => set('message', e.target.value)} />
                  </div>
                  {error && <div className="form-error" role="alert">⚠️ {error}</div>}
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Bhej rahe hain…' : (<><i className="fab fa-whatsapp" /> Submit & WhatsApp Par Bhejo</>)}
                  </button>
                  <p className="secure-note"><i className="fas fa-lock" /> Aapki details sirf hiring ke liye use hogi.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="careers-section" style={{ paddingTop: 0 }}>
        <p className="sec-eyebrow">Sawaal-Jawaab</p>
        <h2 className="sec-title">Aksar Puche Jaane Wale Sawaal</h2>
        <div className="faq-list" style={{ marginTop: '2rem' }}>
          {faqs.map((f, i) => (
            <div key={f.q} className="faq-item">
              <button type="button" className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                {f.q}<i className={`fas ${openFaq === i ? 'fa-minus' : 'fa-plus'}`} style={{ color: '#a27341' }} />
              </button>
              {openFaq === i && <p className="faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="careers-section" style={{ paddingTop: 0 }}>
        <div className="bottom-cta">
          <h2>Kaam Ready Hai — <span>Sirf Aapki Zaroorat Hai</span></h2>
          <p>Der mat karo — post limited hain. Aaj apply karo, is hafte joining pakki karo.</p>
          <div className="hero-cta-row">
            <a className="btn-call" href={`tel:${CALL_NUMBER}`}><i className="fas fa-phone" /> {PHONES.mumbaiPrimary.display}</a>
            <a className="btn-wa" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Namaste! Maine aapki carpenter ki job dekhi hai (Senior / Carpenter / Junior / Helper). Mujhe apply karna hai, niche meri details de di hai.\nNaam: \nMobile: \nExperience: ')}`} target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp" /> WhatsApp Karo</a>
          </div>
        </div>
      </section>
    </div>
  );
}
