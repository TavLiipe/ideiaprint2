import React from 'react';
import { Award, Clock, Users, Zap } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Award, label: 'Anos de Experiência', value: '15+' },
    { icon: Users, label: 'Clientes Satisfeitos', value: '2500+' },
    { icon: Clock, label: 'Projetos Entregues', value: '10K+' },
    { icon: Zap, label: 'Entrega Rápida', value: '24h' }
  ];

  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                <span className="text-blue-700">Sobre</span> a <span className="text-orange-500">Ideia Print</span>
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
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
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl p-6 shadow-xl">
              <img 
                src="https://images.pexels.com/photos/7654904/pexels-photo-7654904.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Equipe Ideia Print"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;