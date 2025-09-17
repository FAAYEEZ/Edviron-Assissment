import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  School, 
  Search, 
  Plus,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'All Transactions',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    name: 'School Transactions',
    href: '/transactions/school',
    icon: School,
  },
  {
    name: 'Transaction Status',
    href: '/transaction-status',
    icon: Search,
  },
  {
    name: 'Create Payment',
    href: '/create-payment',
    icon: Plus,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, collapsed = false, onToggleCollapse }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-background border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className={cn("flex flex-col h-full", collapsed ? "w-20" : "w-64")}> 
          {/* Top bar: title + desktop toggle + mobile close */}
          <div className="flex items-center justify-between p-4 border-b">
            {!collapsed && <span className="text-lg font-semibold hidden md:inline">Menu</span>}
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="hidden md:inline-flex">
                {collapsed ? 
                  (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4"><path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2"/></svg>) :
                  (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2"/></svg>)
                }
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 px-4 py-4 space-y-2", collapsed && "px-2")}> 
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={onClose} // Close mobile menu on navigation
                >
                  <Icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")}/>
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-2 md:p-4 border-t">
            {!collapsed && <p className="text-xs text-muted-foreground">School Payment Dashboard v1.0</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;