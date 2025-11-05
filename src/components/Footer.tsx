import React from 'react';
import { MapPin, Phone, Mail, Instagram, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="text-white relative"
      style={{
        background: 'linear-gradient(135deg, rgba(1, 16, 31, 0.95) 0%, rgba(0, 8, 18, 0.95) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://cdn.discordapp.com/attachments/980003561863782420/1416863885071356035/26e1a8eb-5222-4737-953d-ab4f9c0f85cf.png?ex=68c864d2&is=68c71352&hm=798d6ec3d77c257ed103625156cde870e0662baec1ff7c78a9bd3b8faa8a42e5&" 
                  alt="Ideia Print Logo"
                  className="w-12 h-12 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">Ideia Print</span>
                  <span className="text-sm text-gray-400">Gráfica</span>
                </div>
              </div>
              
              <p className="text-gray-400 leading-relaxed">
                Há mais de 15 anos oferecendo soluções em comunicação visual e 
                impressão digital com qualidade e rapidez.
              </p>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/ideiaprint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/ideiaprint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com/company/ideiaprint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Serviços</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#servicos" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Cartões de Visita
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Banners e Placas
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Adesivos
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Impressão UV
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Corte a Laser
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Design Gráfico
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Links Úteis</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#inicio" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Serviços
                  </a>
                </li>
                <li>
                  <a href="#portfolio" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Portfólio
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#contato" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Contato</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                  <div className="text-gray-400 text-sm">
                    Rua das Impressões, 123<br />
                    Centro - São Paulo - SP<br />
                    CEP: 01234-567
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="text-gray-400 text-sm">
                    <a href="tel:+551134567890" className="hover:text-white transition-colors">
                      (11) 3456-7890
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="text-gray-400 text-sm">
                    <a href="https://wa.me/5511999999999" className="hover:text-white transition-colors">
                      (11) 99999-9999
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="text-gray-400 text-sm">
                    <a href="mailto:contato@ideiaprint.com.br" className="hover:text-white transition-colors">
                      contato@ideiaprint.com.br
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Ideia Print. Todos os direitos reservados.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;