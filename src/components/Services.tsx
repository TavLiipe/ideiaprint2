import React, { useState } from 'react';

const Services = () => {
  const [zoomedImage, setZoomedImage] = useState(null);

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
    <section id="servicos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossos Serviços</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos soluções completas em comunicação visual e impressão digital 
            com tecnologia de ponta e acabamento profissional.
          </p>
        </div>

        {/* Grid de Serviços */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col items-center"
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
                  <li key={featureIndex} className="text-sm text-gray-700 flex items-center justify-center">
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
