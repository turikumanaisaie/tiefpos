import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, BarChart3, ScanBarcode } from "lucide-react";

const tabs = [
  { path: "/", icon: ShoppingCart, label: "Sales" },
  { path: "/products", icon: Package, label: "Products" },
  { path: "/scan-add", icon: ScanBarcode, label: "Add" },
  { path: "/history", icon: BarChart3, label: "History" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
