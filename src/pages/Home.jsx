import Navbar from "../components/Fragments/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router"; 
import Button from "../components/Elements/Button";

export default function Home() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/blog"); 
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center pt-32 lg:pt-0">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between max-w-[90%]">
          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight mb-4">
              Jadilah Bagian dari Inovasi dan Karya-Karya Hebat
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Temukan dan pamerkan karya-karya luar biasa di sini. Bergabunglah sekarang untuk menjadi bagian dari komunitas inovator!
            </p>
            <Button onClick={handleStartClick} color="rose" className="text-lg">Mulai</Button>
          </motion.div>

          {/* Illustration Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="lg:w-1/2 flex justify-end"
          >
            <div className="relative">
              {/* Placeholder for illustration */}
              <div className="w-64 h-54 sm:w-96 sm:h-80 flex items-center justify-center">
                <img src="../src/assets/website.svg" alt="website" />
              </div>
              {/* Decorative animated dots */}
              <motion.div
                className="absolute -top-5 -left-5 w-10 h-10 bg-rose-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-8 h-8 bg-rose-400 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}