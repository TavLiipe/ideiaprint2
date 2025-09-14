import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <MessageCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Precisa de impressão <span className="text-orange-400">rápida</span>?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Fale com a Ideia Print agora mesmo! Nossa equipe está pronta para 
              atender seu projeto com agilidade e qualidade excepcional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/5511999999999?text=Olá! Preciso de impressão rápida. Podem me ajudar?"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Falar no WhatsApp
              <ArrowRight className="w-6 h-6 ml-3" />
            </a>
            
            <a
              href="tel:+551134567890"
              className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              Ligar Agora
            </a>
          </div>

          <div className="mt-8 text-blue-100">
            <p className="text-sm">
              ⚡ Resposta em até 5 minutos • 📱 Atendimento 24/7 • 🚀 Entrega expressa
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;