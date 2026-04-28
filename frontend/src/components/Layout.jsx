import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Compass, LogOut, UserCircle } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Ask AI', path: '/chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Discover', path: '/discover', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Mobile */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center fixed top-0 w-full z-50">
        <h1 className="text-xl font-bold text-primary-600">RightsNavigator</h1>
        <button onClick={handleLogout} className="text-slate-500">
           <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen fixed left-0 top-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
            RightsNavigator
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                  ? 'bg-primary-50 text-primary-600 font-medium shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? "text-primary-600" : "text-slate-400"} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 mt-16 md:mt-0 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </div>

      {/* Bottom Nav Mobile */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50 pb-safe">
         {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            )
          })}
      </div>
    </div>
  );
};

export default Layout;
