import Button from '../Elements/Button';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';
import logosija from '../../assets/logo_sija.png';
import logostemba from '../../assets/logo_stemba.png';
import { useNavigate } from 'react-router';

const Footer = () => {
  const navigate = useNavigate();

  const handleContact = () => {
    navigate('/contact');``
  };
  return (
    <footer className="bg-white text-center py-10">
      <div className="px-4 max-w-4xl mx-auto py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Terampil. Lincah. Kolaboratif.
        </h2>
        <p className="text-sm text-gray-700 max-w-2xl mx-auto mb-6">
          Kami adalah tim kreatif dan bersemangat dari jurusan SIJA, siap mengembangkan ide-ide Anda dan mendukung pelaksanaan setiap proyek teknologi dengan percaya diri. Kami selalu siap bergerak cepat dan menikmati setiap proses menghasilkan karya terbaik.
        </p>
        <Button color="rose" className="inline-flex items-center gap-2" onClick={handleContact}>
          🖐️ Contact
        </Button>
      </div>

      <div className="border-t border-gray-200 mt-10 pt-6 px-4 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <img src={logostemba} alt={logostemba} className="h-8" />
          <img src={logosija} alt={logosija} className="h-8" />
        </div>
        <p>© 2024 Mading Sija Stembase. All Rights Reserved.</p>
        <div className="flex items-center gap-4 text-gray-600 text-lg">
          <a href="https://www.instagram.com/smknegeri7semarang/" target="_blank" rel="noopener noreferrer" className='p-1.5 border rounded-full hover:text-rose-600 hover:bg-rose-500/10'><FaInstagram /></a>
          <a href="https://x.com/stembasemarang" target="_blank" rel="noopener noreferrer" className='p-1.5 border rounded-full hover:text-rose-600 hover:bg-rose-500/10'><FaTwitter /></a>
          <a href="https://www.facebook.com/stemba.semarang/?locale=id_ID" target="_blank" rel="noopener noreferrer" className='p-1.5 border rounded-full hover:text-rose-600 hover:bg-rose-500/10'><FaFacebookF /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;