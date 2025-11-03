import React from 'react';
import { CreditCard, Image, Sticker, Zap, Scissors, Palette } from 'lucide-react';

const Services = () => {
  const services = [
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      icon: CreditCard,
      title: 'Cartões de Visita',
      description: 'Cartões personalizados com acabamento premium e design exclusivo.',
      features: ['Papel couchê', 'Verniz UV', 'Corte especial', 'Laminação']
    },
    {
      image: 'https://i.ibb.co/9mL640Qq/TESTE.png',
      icon: Image,
      title: 'Banners e Placas',
      description: 'Impressão em lona, PVC e outros materiais para comunicação visual.',
      features: ['Lona vinílica', 'PVC expandido', 'Impressão UV', 'Placas de ACM']
    },
    {
      image: 'https://i.ibb.co/1Ghk1jPn/FAIXA.png',
      icon: Sticker,
      title: 'Adesivos',
      description: 'Adesivos personalizados para veículos, vitrines e decoração.',
      features: ['Vinil automotivo', 'Recorte eletrônico', 'Laminação', 'Etiquetas']
    },
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      icon: Zap,
      title: 'Impressão UV',
      description: 'Tecnologia UV para impressão em diversos materiais rígidos.',
      features: ['Madeira', 'Acrílico', 'Metal', 'Vidro', 'Cerâmica']
    },
    {
      image: 'https://i.ibb.co/9mL640Qq/TESTE.png',
      icon: Scissors,
      title: 'Corte a Laser',
      description: 'Cortes precisos em acrílico, MDF e outros materiais.',
      features: ['Alta precisão', 'Acabamento perfeito', 'MDF', 'Acrílico', 'Gravação']
    },
    {
      image: 'https://i.ibb.co/1Ghk1jPn/FAIXA.png',
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
            Nossos <span className="text-white-500">Serviços</span>
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
  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col items-center"
>
  {/* Imagem centralizada maior */}
  {service.image && (
    <div className="flex justify-center mb-4 w-full">
      <img 
        src={service.image} 
        alt={service.title} 
        className="w-full h-48 object-contain rounded-lg" 
      />
    </div>
  )}

  {/* Título */}
  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-blue-700 transition-colors duration-300">
    {service.title}
  </h3>

  {/* Descrição */}
  <p className="text-gray-600 mb-6 leading-relaxed text-center">
    {service.description}
  </p>

  {/* Features */}
  <ul className="space-y-2 text-center">
    {service.features.map((feature, featureIndex) => (
      <li key={featureIndex} className="flex items-center justify-center text-sm text-gray-700">
        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
        {feature}
      </li>
    ))}
  </ul>

  {/* CTA */}
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
