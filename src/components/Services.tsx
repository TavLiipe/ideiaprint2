import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';

const Services = () => {
  const [zoomedImage, setZoomedImage] = useState(null);
  const [ref, isInView] = useInView();

  const services = [
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      title: 'Cartões de Visita',
      description: 'Cartões personalizados com acabamento premium e design exclusivo.',
      features: ['Papel couchê', 'Verniz UV', 'Corte especial', 'Laminação']
    },
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      title: 'Banners e Placas',
      description: 'Impressão em lona, PVC e outros materiais para comunicação visual.',
      features: ['Lona vinílica', 'PVC expandido', 'Impressão UV', 'Placas de ACM']
    },
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      title: 'Adesivos',
      description: 'Adesivos personalizados para veículos, vitrines e decoração.',
      features: ['Vinil automotivo', 'Recorte eletrônico', 'Laminação', 'Etiquetas']
    },
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      title: 'Impressão UV',
      description: 'Tecnologia UV para impressão em diversos materiais rígidos.',
      features: ['Madeira', 'Acrílico', 'Metal', 'Vidro', 'Cerâmica']
    },
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      title: 'Corte a Laser',
      description: 'Cortes precisos em acrílico, MDF e outros materiais.',
      features: ['Alta precisão', 'Acabamento perfeito', 'MDF', 'Acrílico', 'Gravação']
    },
    {
      image: 'https://i.ibb.co/S4LMfbXn/1-MOCKUP.png',
      title: 'Design Gráfico',
      description: 'Criação de layouts e identidade visual para sua empresa.',
      features: ['Logotipos', 'Layouts', 'Identidade visual', 'Catálogos', 'Folders']
    }
  ];

  return (
    <section id="servicos" className="py-20 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl font-bold text-white mb-4">Nossos Serviços</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Oferecemos soluções completas em comunicação visual e impressão digital 
            com tecnologia de ponta e acabamento profissional.
          </p>
        </div>

        {/* Grid de Serviços */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 flex flex-col items-center ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Imagem clicável */}
              {service.image && (
                <div
                  className="flex justify-center mb-4 w-full cursor-pointer"
                  onClick={() => setZoomedImage(service.image)}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-contain rounded-lg transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}

              {/* Título */}
              <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-orange-400 transition-colors duration-300">
                {service.title}
              </h3>

              {/* Descrição */}
              <p className="text-gray-300 mb-6 leading-relaxed text-center">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 text-center">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="text-sm text-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Zoom */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer transition-opacity duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            className="max-w-full max-h-full rounded-lg shadow-2xl transform transition-transform duration-300 scale-95 hover:scale-100"
          />
        </div>
      )}
    </section>
  );
};

export default Services;
