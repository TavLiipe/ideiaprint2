import React from 'react';
import { ExternalLink, Instagram } from 'lucide-react';

const Portfolio = () => {
  const projects = [
    {
      title: 'Cartões Premium',
      category: 'Cartões de Visita',
      image: 'https://ibb.co/r20L9f1w'
    },
    {
      title: 'Banner Corporativo',
      category: 'Sinalização',
      image: ''
    },
    {
      title: 'Adesivos Personalizados',
      category: 'Adesivos',
      image: ''
    },
    {
      title: 'Placas em Acrílico',
      category: 'Corte a Laser',
      image: ''
    },
    {
      title: 'Impressão UV',
      category: 'Materiais Especiais',
      image: ''
    },
    {
      title: 'Design de Logotipo',
      category: 'Design Gráfico',
      image: ''
    }
  ];

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nosso <span className="text-blue-700">Portfólio</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Confira alguns dos nossos trabalhos realizados com excelência e criatividade.
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-orange-400 text-sm font-semibold mb-2">
                    {project.category}
                  </div>
                  <h3 className="text-white text-xl font-bold mb-4">
                    {project.title}
                  </h3>
                  <button className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="text-center">
          <a
            href="https://instagram.com/ideiaprint"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
          >
            <Instagram className="w-6 h-6 mr-3" />
            Ver mais no Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;