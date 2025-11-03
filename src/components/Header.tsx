import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, DoorOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Início', href: '#inicio' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Portfólio', href: '#portfolio' },
    { label: 'Sobre Nós', href: '#sobre' },
    { label: 'Contato', href: '#contato' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'shadow-lg' : ''
  }`}
  style={{
    backgroundImage: "url('https://i.ibb.co/1Ghk1jPn/FAIXA.png')", // 🔗 coloque aqui a URL da sua imagem
    backgroundSize: 'cover', // cobre toda a largura
    backgroundRepeat: 'no-repeat', // evita repetir
    backgroundPosition: 'center', // centraliza a imagem
  }}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-20"> {/* aumentei um pouco a altura */}
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.ibb.co/1JmWbkdQ/LOGO-HORIZONTAL.png" 
              alt="Ideia Print Logo"
              className="w-5 h-5 object-contain"
            />
            <div className="flex flex-col">
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Solicitar Orçamento
            </a>
            
            {user ? (
              <a
                href="/admin/dashboard"
                className="inline-flex items-center px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200"
              >
                <DoorOpen className="w-4 h-4 mr-2" />
                Painel
              </a>
            ) : (
              <a
                href="/admin/login"
                className="inline-flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
              >
                <DoorOpen className="w-4 h-4 mr-2" />
                Entrar
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-700 transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden bg-white border-t border-gray-200`}>
        <div className="px-4 py-4 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className="block w-full text-left py-2 text-gray-700 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              {item.label}
            </button>
          ))}
          <a
            href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 mt-4"
          >
            <Phone className="w-4 h-4 mr-2" />
            Solicitar Orçamento
          </a>
          
          {user ? (
            <a
              href="/admin/dashboard"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200 mt-4"
            >
              <DoorOpen className="w-4 h-4 mr-2" />
              Painel
            </a>
          ) : (
            <a
              href="/admin/login"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 mt-4"
            >
              <DoorOpen className="w-4 h-4 mr-2" />
              Entrar
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;