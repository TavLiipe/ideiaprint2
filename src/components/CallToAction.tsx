import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50 mb-8">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Precisa de impressão <span className="text-orange-400">rápida</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Fale com a Ideia Print agora mesmo! Nossa equipe está pronta para
              atender seu projeto com agilidade e qualidade excepcional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="https://wa.me/5511999999999?text=Olá! Preciso de impressão rápida. Podem me ajudar?"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg shadow-green-500/50"
            >
              <MessageCircle className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Falar no WhatsApp
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="tel:+551134567890"
              className="inline-flex items-center px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-2xl transition-all duration-300 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 transform hover:scale-105"
            >
              Ligar Agora
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">Resposta em até 5 minutos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm font-medium">Atendimento 24/7</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-sm font-medium">Entrega expressa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;