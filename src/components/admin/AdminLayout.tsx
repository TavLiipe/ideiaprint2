import React, { useState } from 'react';
import OrderForm from './OrderForm';
import OrderDetail from './OrderDetail';
import OrderList from './OrderList';
import Reports from './Reports';
import Calendar from './Calendar';
import Settings from './Settings';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Package, 
  Plus, 
  BarChart3,
  User,
  Users,
  Settings,
  FileText,
  Calendar as CalendarIcon,
  Search,
  Bell,
  Archive
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company?: string;
  service: string;
  description?: string;
  status: 'em_producao' | 'finalizado' | 'cancelado';
  delivery_date: string;
  created_at: string;
  updated_at: string;
  employee_id: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const handleNewOrder = () => {
    setShowOrderForm(true);
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
  };

  const handleOrderSaved = () => {
    // Refresh orders list if we're on orders view
    if (currentView === 'orders') {
      // This will trigger a re-render of OrderList
      setCurrentView('orders');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'orders':
        return (
          <OrderList 
            onSelectOrder={handleSelectOrder}
            onNewOrder={handleNewOrder}
          />
        );
      case 'reports':
        return (
          <Reports />
        );
      case 'calendar':
        return (
          <Calendar />
        );
      case 'new-order':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Novo Pedido</h1>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <p className="text-gray-600">Use o botão "Novo Pedido" na lista de pedidos para criar um novo pedido.</p>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Buscar</h1>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <p className="text-gray-600">Busca avançada em desenvolvimento.</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <p className="text-gray-600">Central de notificações em desenvolvimento.</p>
            </div>
          </div>
        );
      case 'archive':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Arquivo</h1>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <p className="text-gray-600">Pedidos arquivados em desenvolvimento.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <Settings />
        );
      default:
        return children;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IP</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Ideia Print</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            <button
              onClick={() => handleViewChange('dashboard')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => handleViewChange('orders')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'orders' 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5 mr-3" />
              Pedidos
            </button>
            <button
              onClick={() => handleViewChange('new-order')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'new-order' 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-5 h-5 mr-3" />
              Novo Pedido
            </button>
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
            
            <button
              onClick={() => handleViewChange('calendar')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'calendar'
                  ? 'text-orange-700 bg-orange-100'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CalendarIcon className="w-5 h-5 mr-3" />
              Agenda
            </button>
            
            <button
              onClick={() => handleViewChange('reports')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'reports' 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Relatórios
            </button>
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
            
            <button
              onClick={() => handleViewChange('search')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'search' 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5 mr-3" />
              Buscar
            </button>
            
            <button
              onClick={() => handleViewChange('notifications')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'notifications' 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5 mr-3" />
              Notificações
            </button>
            
            <button
              onClick={() => handleViewChange('archive')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'archive' 
                  ? 'text-orange-700 bg-orange-100' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Archive className="w-5 h-5 mr-3" />
              Arquivo
            </button>
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            <button
              onClick={() => handleViewChange('settings')}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'settings'
                  ? 'text-orange-700 bg-orange-100'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Configurações
            </button>

            <button
              onClick={handleSignOut}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-700 hover:bg-red-100`}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-20 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl rounded-r-3xl">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 pt-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">IP</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-8 space-y-4">
            <button
              onClick={() => handleViewChange('dashboard')}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                currentView === 'dashboard' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
              }`}
            >
              <Home className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Dashboard
              </div>
            </button>
            
            <button
              onClick={() => handleViewChange('orders')}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                currentView === 'orders' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
              }`}
            >
              <Package className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Pedidos
              </div>
            </button>
            
            <button
              onClick={() => handleViewChange('new-order')}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                currentView === 'new-order' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
              }`}
            >
              <Plus className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Novo Pedido
              </div>
            </button>
            
            {/* Spacer */}
            <div className="h-4"></div>
            
            <button
              onClick={() => handleViewChange('calendar')}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                currentView === 'calendar'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
              }`}
            >
              <CalendarIcon className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Agenda
              </div>
            </button>
            
            <button
              onClick={() => handleViewChange('reports')}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                currentView === 'reports' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Relatórios
              </div>
            </button>
          </nav>
          
          {/* Bottom section */}
          <div className="px-3 pb-6 space-y-4">
            <button
              onClick={() => handleViewChange('settings')}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                currentView === 'settings'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
              }`}
            >
              <Settings className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Configurações
              </div>
            </button>
            <button
              onClick={handleSignOut}
              className="group relative flex items-center justify-center w-14 h-14 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
            >
              <LogOut className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Sair
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-20">
        {/* Top bar - Desktop */}
        <div className="hidden lg:flex items-center justify-end h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-gray-500">Usuário logado</p>
                </div>
              </div>
            )}
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>

        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <img 
                src="https://cdn.discordapp.com/attachments/980003561863782420/1416863885071356035/26e1a8eb-5222-4737-953d-ab4f9c0f85cf.png?ex=68c864d2&is=68c71352&hm=798d6ec3d77c257ed103625156cde870e0662baec1ff7c78a9bd3b8faa8a42e5&" 
                alt="Ideia Print Logo"
                className="w-8 h-8 object-contain rounded-lg"
              />
              <span className="text-lg font-bold text-gray-900">Ideia Print</span>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.email}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      {showOrderForm && (
        <OrderForm 
          onClose={handleCloseOrderForm}
          onSave={handleOrderSaved}
        />
      )}

      {selectedOrder && (
        <OrderDetail 
          order={selectedOrder}
          onClose={handleCloseOrderDetail}
          onUpdate={handleOrderSaved}
        />
      )}
    </div>
  );
};

export default AdminLayout;