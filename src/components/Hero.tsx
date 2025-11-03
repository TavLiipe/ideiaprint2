import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section
  id="inicio"
  className="relative w-full bg-contain bg-center bg-no-repeat"
  style={{
    backgroundImage: 'url("https://i.ibb.co/VpvyKFzZ/TESTE.png")',
    height: '1040px', // altura fixa para corresponder à arte
  }}
>
  <div className="absolute inset-0 bg-black/60"></div>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
  <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
            </div>

            {/* Features */}
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-100">Alta Qualidade</span>
              </div>
              <div classNames="flex items-center space-x-3">
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
                <img
                  src="https://i.ibb.co/S4LMfbXn/1-MOCKUP.png"
                  alt="Materiais gráficos da Ideia Print"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
    </section>
  );
};

export default Hero;