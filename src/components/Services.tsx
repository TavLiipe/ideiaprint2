import React from 'react';
import { CreditCard, Image, Sticker, Zap, Scissors, Palette } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: CreditCard,
      title: 'Cartões de Visita',
      description: 'Cartões personalizados com acabamento premium e design exclusivo.',
      features: ['Papel couchê', 'Verniz UV', 'Corte especial', 'Laminação']
    },
    {
      icon: Image,
      title: 'Banners e Placas',
      description: 'Impressão em lona, PVC e outros materiais para comunicação visual.',
      features: ['Lona vinílica', 'PVC expandido', 'Impressão UV', 'Placas de ACM']
    },
    {
      icon: Sticker,
      title: 'Adesivos',
      description: 'Adesivos personalizados para veículos, vitrines e decoração.',
      features: ['Vinil automotivo', 'Recorte eletrônico', 'Laminação', 'Etiquetas']
    },
    {
      icon: Zap,
      title: 'Impressão UV',
      description: 'Tecnologia UV para impressão em diversos materiais rígidos.',
      features: ['Madeira', 'Acrílico', 'Metal', 'Vidro', 'Cerâmica']
    },
    {
      icon: Scissors,
      title: 'Corte a Laser',
      description: 'Cortes precisos em acrílico, MDF e outros materiais.',
      features: ['Alta precisão', 'Acabamento perfeito', 'MDF', 'Acrílico', 'Gravação']
    },
    {
      icon: Palette,
      title: 'Design Gráfico',
      description: 'Criação de layouts e identidade visual para sua empresa.',
      features: ['Logotipos', 'Layouts', 'Identidade visual', 'Catálogos', 'Folders']
    }
  ];

  return (
    <section id="servicos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nossos <span className="text-orange-500">Serviços</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos soluções completas em comunicação visual e impressão digital 
            com tecnologia de ponta e acabamento profissional.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <a
                  href={`https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o serviço de ${service.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-200"
                >
                  Solicitar Orçamento
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;