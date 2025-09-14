import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  Package,
  User,
  AlertTriangle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  client_name: string;
  service: string;
  status: 'em_producao' | 'finalizado' | 'cancelado';
  delivery_date: string;
  created_at: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, [currentDate]);

  const fetchOrders = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data } = await supabase
        .from('orders')
        .select('id, client_name, service, status, delivery_date, created_at')
        .gte('delivery_date', format(start, 'yyyy-MM-dd'))
        .lte('delivery_date', format(end, 'yyyy-MM-dd'))
        .order('delivery_date', { ascending: true });

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => 
      isSameDay(parseISO(order.delivery_date), date)
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedOrders(getOrdersForDate(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_producao':
        return 'bg-yellow-500';
      case 'finalizado':
        return 'bg-green-500';
      case 'cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_producao':
        return 'Em Produção';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const isOverdue = (order: Order) => {
    return order.status === 'em_producao' && 
           isBefore(parseISO(order.delivery_date), startOfDay(new Date()));
  };

  const overdueOrders = orders.filter(isOverdue);
  const todayOrders = getOrdersForDate(new Date());
  const upcomingOrders = orders.filter(order => 
    order.status === 'em_producao' && 
    !isBefore(parseISO(order.delivery_date), startOfDay(new Date()))
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Entregas</h1>
          <p className="text-gray-600 mt-1">Gerencie prazos e entregas</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregas Hoje</p>
              <p className="text-3xl font-bold text-blue-600">{todayOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Atraso</p>
              <p className="text-3xl font-bold text-red-600">{overdueOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximas Entregas</p>
              <p className="text-3xl font-bold text-green-600">{upcomingOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map(date => {
                const dayOrders = getOrdersForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative p-2 h-20 text-left border rounded-lg transition-all duration-200
                      ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}
                      ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'text-gray-900'}
                      ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium ${isTodayDate ? 'text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </div>
                    
                    {dayOrders.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayOrders.slice(0, 2).map((order, index) => (
                          <div
                            key={index}
                            className={`w-full h-1 rounded-full ${getStatusColor(order.status)} ${
                              isOverdue(order) ? 'animate-pulse' : ''
                            }`}
                          />
                        ))}
                        {dayOrders.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayOrders.length - 2} mais
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Orders */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, 'dd \'de\' MMMM', { locale: ptBR })}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrders.length} {selectedOrders.length === 1 ? 'entrega' : 'entregas'}
                </p>
              </div>
              <div className="p-6">
                {selectedOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma entrega agendada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedOrders.map(order => (
                      <div
                        key={order.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          isOverdue(order) ? 'border-red-500 bg-red-50' : 
                          order.status === 'em_producao' ? 'border-yellow-500 bg-yellow-50' :
                          order.status === 'finalizado' ? 'border-green-500 bg-green-50' :
                          'border-gray-500 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{order.client_name}</h4>
                            <p className="text-sm text-gray-600">{order.service}</p>
                            <div className="flex items-center mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'em_producao' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'finalizado' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {getStatusText(order.status)}
                              </span>
                              {isOverdue(order) && (
                                <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overdue Orders */}
          {overdueOrders.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-red-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-red-900 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Entregas em Atraso
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {overdueOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-gray-900">{order.client_name}</h4>
                      <p className="text-sm text-gray-600">{order.service}</p>
                      <p className="text-xs text-red-600 mt-1">
                        Venceu em {format(parseISO(order.delivery_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Orders */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Próximas Entregas
              </h3>
            </div>
            <div className="p-6">
              {upcomingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma entrega próxima
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingOrders.map(order => (
                    <div key={order.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-gray-900">{order.client_name}</h4>
                      <p className="text-sm text-gray-600">{order.service}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {format(parseISO(order.delivery_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;