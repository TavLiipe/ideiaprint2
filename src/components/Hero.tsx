import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section id="inicio" className="pt-20 pb-16 from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-blue-700">Ideia Print</span>
                <br />
                <span className="text-gray-800">Impressões e</span>
                <br />
                <span className="text-orange-500">Comunicação Visual</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Cartões, banners, impressão UV, corte a laser e muito mais com 
                <span className="font-semibold text-blue-700"> qualidade </span>
                e <span className="font-semibold text-orange-500">rapidez</span>
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Entrega Rápida</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Alta Qualidade</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Preços Competitivos</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Atendimento Personalizado</span>
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
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl p-8 shadow-2xl">
              <div className="w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="" 
                  alt="Materiais gráficos da Ideia Print"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              24h
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              UV
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;