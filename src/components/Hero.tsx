import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Spline from '@splinetool/react-spline';

const Hero = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  // Helpers para delay incremental
  const getDelay = (i, base = 200) => ({
    transitionDelay: `${i * base}ms`
  });

  return (
    <section
      id="inicio"
      className="pt-20 pb-16 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url("https://i.ibb.co/1Ghk1jPn/FAIXA.png")' }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Content */}
          <div className="space-y-8">

            {/* Headline com stagger */}
            <div className="space-y-4">
              {[
                'Ideia Print',
                'Impressões e',
                'Comunicação Visual'
              ].map((line, i) => (
                <h1
                  key={i}
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white transform transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
                  style={getDelay(i, 300)}
                >
                  {i === 2 ? <span className="text-orange-400">{line}</span> : <span className="text-white-400">{line}</span>}
                </h1>
              ))}
              <p
                className={`text-xl text-gray-100 leading-relaxed transform transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={getDelay(3, 300)}
              >
                Cartões, banners, impressão UV, corte a laser e muito mais com{' '}
                <span className="font-semibold text-blue-300">qualidade</span> e{' '}
                <span className="font-semibold text-orange-400">rapidez</span>
              </p>
            </div>

            {/* Features com stagger */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Entrega Rápida',
                'Alta Qualidade',
                'Preços Competitivos',
                'Atendimento Personalizado'
              ].map((feat, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 transform transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                  style={getDelay(i + 4, 200)}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-100">{feat}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div
              className={`transform transition-all duration-1000 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              style={getDelay(8, 200)}
            >
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
          </div><img src="https://i.ibb.co/S4LMfbXn/1-MOCKUP.png" alt="Materiais gráficos da Ideia Print" className={w-full h-full object-cover rounded-lg transform transition-all duration-1000 ${loaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}} style={getDelay(9, 200)} />
          
          </div>
      </div>
    </section>
  );
};

export default Hero;
