import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section id="inicio" className="pt-20 pb-16 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url("https://i.ibb.co/1Ghk1jPn/FAIXA.pngP")' }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="text-blue-400">Ideia Print</span>
                <br />
                <span className="text-gray-200">Impressões e</span>
                <br />
                <span className="text-orange-400">Comunicação Visual</span>
              </h1>
              <p className="text-xl text-gray-100 leading-relaxed">
                Cartões, banners, impressão UV, corte a laser e muito mais com
                <span className="font-semibold text-blue-300"> qualidade </span>
                e <span className="font-semibold text-orange-400">rapidez</span>
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-100">Entrega Rápida</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-100">Alta Qualidade</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-100">Preços Competitivos</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-100">Atendimento Personalizado</span>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <a
                href="https://wa.me/5511999999999?text=Olá! Gostaria de fazer um pedido agora."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
              >
                Fazer Pedido Agora
                <ArrowRight className="w-6 h-6 ml-2" />
              </a>
            </div>
          </div>

          {/* Image/Mockup */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-orange-500/20 rounded-2xl p-8 shadow-2xl border border-white/10">
              <div className="w-full h-full bg-white/10 rounded-xl shadow-lg flex items-center justify-center overflow-hidden backdrop-blur-sm border border-white/20">
                <img
                  src="https://i.ibb.co/S4LMfbXn/1-MOCKUP.png"
                  alt="Materiais gráficos da Ideia Print"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;