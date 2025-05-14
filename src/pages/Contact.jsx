import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import Input from '../components/Elements/Input';
import Button from '../components/Elements/Button';
import Notification from '../components/Elements/Notification';
import Navbar from '../components/Fragments/Navbar';
import Footer from '../components/Fragments/Footer';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Contact() {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });

    if (!formData.from_name || !formData.from_email || !formData.message) {
      setNotification({ message: 'Please fill out all fields.', type: 'error' });
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.from_email)) {
      setNotification({ message: 'Please enter a valid email.', type: 'error' });
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      time: new Date().toLocaleString(),
    };

    try {
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      await emailjs.send(serviceID, templateID, dataToSend, publicKey);
      setNotification({ message: 'Message sent successfully!', type: 'success' });
      setFormData({ from_name: '', from_email: '', message: '' });
    } catch (error) {
      setNotification({ message: 'Failed to send message. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Timer untuk menghilangkan notifikasi sukses setelah 3 detik
  useEffect(() => {
    let timer;
    if (notification.type === 'success') {
      timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000); // 3000 ms = 3 detik
    }
    return () => clearTimeout(timer); // Bersihkan timer saat komponen unmount
  }, [notification]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-white pt-32 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row gap-8">
          {/* Contact Information */}
          <div className="relative bg-rose-600 text-white p-8 rounded-lg w-full md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <p className="mb-6">Say something to start a live chat!</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiPhone className="text-white" />
                <p>(024) 8311532</p>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-white" />
                <p>sijastembase@gmail.com</p>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="text-white" />
                <p>Jalan Simpang Lima Semarang</p>
              </div>
            </div>
            {/* Decorative Circles */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
              <div className="absolute bottom-0 left-4 w-24 h-24 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-0 left-16 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">CONTACT US</h1>
            <p className="text-gray-500 mb-8">
              Any question or remarks? Just write us a message!
            </p>
            <Notification message={notification.message} type={notification.type} loading={loading} />
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Name"
                id="from_name"
                name="from_name"
                placeholder="Your Name"
                value={formData.from_name}
                onChange={handleChange}
                autoComplete="name"
                className="block w-full border-b border-gray-300 px-0 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none sm:text-sm/6"
              />
              <Input
                label="Email"
                id="from_email"
                name="from_email"
                type="email"
                placeholder="Your Email"
                value={formData.from_email}
                onChange={handleChange}
                autoComplete="email"
                className="block w-full border-b border-gray-300 px-0 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none sm:text-sm/6"
              />
              <div>
                <label htmlFor="message" className="block text-sm/6 font-medium text-gray-900">
                  Message
                </label>
                <div className="mt-2">
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Write your message..."
                    value={formData.message}
                    onChange={handleChange}
                    className="block w-full border-1 border-gray-300 rounded-md p-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-2 focus:border-rose-500 focus:outline-none sm:text-sm/6"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" color="rose" disabled={loading} className="px-6 py-2">
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}