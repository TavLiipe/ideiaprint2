import React, { useState, useEffect } from 'react';
import { PhoneIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  BriefcaseIcon,
  FolderIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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
    { label: 'Início', href: '#inicio', icon: <HomeIcon className="w-5 h-5 mr-2" /> },
    { label: 'Serviços', href: '#servicos', icon: <BriefcaseIcon className="w-5 h-5 mr-2" /> },
    { label: 'Portfólio', href: '#portfolio', icon: <FolderIcon className="w-5 h-5 mr-2" /> },
    { label: 'Sobre Nós', href: '#sobre', icon: <UserIcon className="w-5 h-5 mr-2" /> },
    { label: 'Contato', href: '#contato', icon: <PhoneIcon className="w-5 h-5 mr-2" /> },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : ''
        }`}
        style={{
          background: isScrolled
            ? 'linear-gradient(135deg, rgba(1, 16, 31, 0.98) 0%, rgba(0, 8, 18, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(1, 16, 31, 0.7) 0%, rgba(0, 8, 18, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="https://i.ibb.co/S77yh02d/LOGO-HORIZONTAL.png"
                alt="Ideia Print Logo"
                className="w-30 h-30 object-contain"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="relative flex items-center text-white font-medium transition-all duration-200 group"
                >
                  {item.icon}
                  {item.label}

                  {/* Barra neon laranja hover */}
                  <span
                    className="absolute left-0 bottom-[-6px] w-0 h-[2px] bg-orange-500 rounded-full transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_10px_2px_rgba(255,165,0,0.8)]"
                  ></span>
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
                <PhoneIcon className="w-5 h-5 mr-2" />
                Solicitar Orçamento
              </a>

              {user ? (
                <a
                  href="/admin/dashboard"
                  className="inline-flex items-center px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Painel
                </a>
              ) : (
                <a
                  href="/admin/login"
                  className="inline-flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Entrar
                </a>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-orange-400 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden bg-white border-t border-gray-200`}
        >
          <div className="px-4 py-4 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center w-full text-left py-2 text-gray-700 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 mt-4"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Solicitar Orçamento
            </a>

            {user ? (
              <a
                href="/admin/dashboard"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200 mt-4"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Painel
              </a>
            ) : (
              <a
                href="/admin/login"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 mt-4"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Entrar
              </a>
            )}
          </div>
        </div>

        {/* 🔥 Barra neon inferior fixa */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500 shadow-[0_0_15px_3px_rgba(255,165,0,0.9)]"></div>
      </header>
    </>
  );
};

export default Header;
