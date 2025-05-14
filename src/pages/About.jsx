import Footer from "../components/Fragments/Footer";
import Navbar from "../components/Fragments/Navbar";
import Cisco from "../assets/cisco.png"
import Council from "../assets/council.png"
import Kkpi from "../assets/kkpi.png"
import Oracle from "../assets/oracle.png"
import Sejarah from "../assets/sejarah.png"

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow bg-white">
        {/* Hero Section with Search */}
        <section className="pt-32 mb-12">
          <div className="container mx-auto max-w-[90%] px-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
              About Us
            </h1>
            <p className="text-center text-gray-500 mb-8">
              Great to have you here! Welcome to our About Us page — here's a
              bit about who we are and what drives us
            </p>
            <div className="flex flex-col gap-6">
              <p>
                Kompetensi Keahlian Teknik Komputer dan Jaringan di SMK Negeri 7
                Semarang berdiri pada tanggal 13 Agustus 2003 berdasarkan Surat
                Walikota Semarang nomor 421.5 / 4575 tertanggal 13 Agustus 2003
                yang ditandatangani oleh Walikota Semarang: H. Sukawi Sutarip,
                SH, SE.
              </p>
              <p>
                Seiring berjalannya waktu dan kebutuhan akan kompetensi yang
                diperlukan di masyarakat dan di industri, Kompetensi Keahlian
                Teknik Komputer dan Jaringan di SMK Negeri 7 Semarang telah
                dipersiapkan sejak tahun 2001 dengan menjalin kerjasama dengan
                Cisco Networking Academy sebagai Local Academy Cisco yang
                berpusat di San Jose, California, Amerika Serikat sampai
                sekarang dengan Cisco Academy, ID 42600.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 px-4">
                <img src={Cisco} alt={Cisco} className="w-25 h-auto object-contain" />
                <img src={Kkpi} alt={Kkpi} className="w-45 h-auto object-contain" />
                <img src={Oracle} alt={Oracle} className="w-45 h-auto object-contain" />
                <img src={Council} alt={Council} className="w-50 h-auto object-contain" />
              </div>
              <p>
                Selanjutnya sejak tahun 2004 sampai sekarang Kompetensi Keahlian
                Teknik Komputer dan Jaringan di SMK Negeri 7 Semarang telah
                menjadi Tempat Uji Kompetensi Regional (TUKR) untuk
                bidang Keterampilan Komputer dan Pengelolaan
                Informasi (KKPI) yang berpusat di Pusat Pengembangan dan
                Pemberdayaan Pendidik dan Tenaga Kependidikan (P4TK)/Vocational
                Education Development Center (VEDC) Malang.
              </p>
              <p>
                Sesuai dengan kebutuhan akan penyiapan tamatan yang memenuhi
                kebutuhan tenaga kerja di bidang teknologi informasi, maka sejak
                tanggal 17 Juni 2013 Kompetensi Keahlian Teknik Komputer dan
                Jaringan di SMK Negeri 7 Semarang telah menjadi School Academy
                Oracle dari Oracle Academy yang berpusat di Redwood Shores,
                California, Amerika Serikat dengan Oracle Academy License :
                20470088.
              </p>
              <p>
                Selanjutnya seiring berjalannya waktu, maka mulai tanggal 27
                Maret 2015 Kompetensi Keahlian Teknik Komputer dan Jaringan di
                SMK Negeri 7 Semarang telah menjadi TUK (Tempat Uji Kompetensi)
                bidang Pekerjaan Teknik Informatika pada Lembaga Sertifikasi
                Profesi (LSP) Multimedia dan Informatika (MIKA), yang sekarang
                bernama ANIMEDIA (Animasi, Sinematografi, Desain, dan
                Informatika).
              </p>
              <p>
                Sejarah telah mencatat, bahwa sejak berdirinya Kompetensi
                Keahlian Teknik Komputer dan Jaringan di SMK Negeri 7 Semarang
                yang pernah diberi amanah sebagai Ketua Kompetensi Keahlian
                adalah sebagai berikut :
              </p>
              {/* <p>tesssssssssss</p> */}
              <p>
                Selanjutnya berdasarkan Peraturan Direktur Jenderal Pendidikan
                Dasar dan Menengah Nomor : 06 / D.D5 / KK / 2018 tanggal 07 Juni
                2018 tentang Spektrum Keahlian Sekolah Menengah Kejuruan (SMK)/
                Madrasah Aliyah Kejuruan (MAK), maka kompetensi keahlian Teknik
                Komputer dan Jaringan di SMK Negeri 7 Semarang berubah namanya
                menjadi Sistem Informatika, Jaringan, dan Aplikasi dengan
                program pendidikan 4 tahun.
              </p>
              <p>
                Seiring berjalannya waktu, maka sejak SMK Negeri 7 Semarang
                ditetapkan sebagai salah satu SMK Pusat Keunggulan berdasarkan
                Surat Keputusan Mendikbudristek No. : 165 / M / 2021 tanggal 09
                Juli 2021 Tentang Program Sekolah Menengah Kejuruan Pusat
                Keunggulan, maka Kompetensi Keahlian Sistem Informatika,
                Jaringan, dan Aplikasi berubah namanya menjadi Teknik Jaringan
                Komputer dan Telekomunikasi dengan program pendidikan 4 tahun.
              </p>
              <p>
                Dengan mengikuti dinamika perjalanan dan kebijakan Kementerian
                Pendidikan, Kebudayaan, Riset, dan Teknologi, maka sejak
                diterbitkannya Surat Keputusan Kepala Badan Standar, Kurikulum,
                dan Asesmen Pendidikan Kemdikbudristek Nomor : 024 / H / KR/
                2022 Tentang Konsentrasi Keahlian SMK / MAK pada Kurikulum
                Merdeka selanjutnya Kompetensi Keahlian Sistem Informatika,
                Jaringan, dan Aplikasi berubah menjadi Sistem Informasi,
                Jaringan, dan Aplikasi dengan program pendidikan 4 tahun.
              </p>
              <p>
                Seiring berjalannya waktu dan perkembangan teknologi informasi,
                maka upaya senantiasa dilakukan guna melengkapi diri agar dapat
                eksis. Maka terhitung mulai tanggal 25 Agustus 2022, Konsentrasi
                Keahlian Sistem Informasi, Jaringan, dan Aplikasi di SMK Negeri
                7 Semaran telah menjadi EC - Council Academia Partner yang
                berkantor pusat di Albuquerque, New Mexico, Amerika dengan
                Partner ID : EACD68782.
              </p>
              <img src={Sejarah} alt={Sejarah} className="w-full h-auto object-contain" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
