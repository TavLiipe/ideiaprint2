import React from 'react';
import { Award, Clock, Users, Zap } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const About = () => {
  const [ref, isInView] = useInView();

  const stats = [
    { icon: Award, label: 'Anos de Experiência', value: '15+' },
    { icon: Users, label: 'Clientes Satisfeitos', value: '2500+' },
    { icon: Clock, label: 'Projetos Entregues', value: '10K+' },
    { icon: Zap, label: 'Entrega Rápida', value: '24h' }
  ];

  return (
    <section id="sobre" className="py-20 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className={`${isInView ? 'animate-fade-in-left' : 'opacity-0'}`}>
              <div className="inline-block mb-4">
                <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">Conheça nossa história</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                <span className="text-orange-400">Sobre</span> a <span className="text-orange-400">Ideia Print</span>
              </h2>
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  Há mais de 15 anos no mercado gráfico, a <strong>Ideia Print</strong> se 
                  consolidou como referência em comunicação visual e impressão digital, 
                  oferecendo soluções criativas e de alta qualidade para empresas e 
                  profissionais de todos os segmentos.
                </p>
                <p>
                  Nossa equipe especializada combina experiência técnica com criatividade, 
                  utilizando equipamentos de última geração para garantir resultados excepcionais 
                  em cada projeto. Do cartão de visita ao grande banner, cada trabalho recebe 
                  nossa atenção personalizada.
                </p>
                <p>
                  Nosso compromisso é transformar suas ideias em realidade, sempre com 
                  agilidade, qualidade e preços justos. Venha conhecer nosso atendimento 
                  diferenciado e descobrir por que somos a escolha de milhares de clientes.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className={`text-center p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl hover:bg-white/15 hover:scale-105 transition-all duration-300 border border-white/20 hover:border-orange-500/30 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className={`relative ${isInView ? 'animate-fade-in-right' : 'opacity-0'}`}>
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/10 to-blue-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 shadow-2xl border border-white/20">
              <img
                src="https://images.pexels.com/photos/7654904/pexels-photo-7654904.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Equipe Ideia Print"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;