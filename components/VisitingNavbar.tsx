import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList } from 'lucide-react';

export default function VisitingNavbar() {
  const pathname = usePathname();

  // Do not render on login page
  if (pathname === '/visiting/login') {
    return null;
  }

  // Determine active state for each tab
  const isDashboardActive = pathname.startsWith('/visiting/dashboard');
  const isInternsActive = pathname.startsWith('/visiting/interns');
  const isAssignmentsActive = pathname.startsWith('/visiting/assignments');

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around bg-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-50">
      {/* Dashboard Tab */}
      <Link href="/visiting/dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
        isDashboardActive
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}>
        <LayoutDashboard className={isDashboardActive ? 'h-5 w-5' : 'h-4 w-4'} />
        <span className={isDashboardActive ? 'text-xs font-medium' : 'text-xs'}>Dashboard</span>
      </Link>

      {/* Interns Tab */}
      <Link href="/visiting/interns" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
        isInternsActive
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}>
        <Users className={isInternsActive ? 'h-5 w-5' : 'h-4 w-4'} />
        <span className={isInternsActive ? 'text-xs font-medium' : 'text-xs'}>Interns</span>
      </Link>

      {/* Assignments/Leads Tab */}
      <Link href="/visiting/assignments" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
        isAssignmentsActive
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}>
        <ClipboardList className={isAssignmentsActive ? 'h-5 w-5' : 'h-4 w-4'} />
        <span className={isAssignmentsActive ? 'text-xs font-medium' : 'text-xs'}>Assignments</span>
      </Link>
    </nav>
  );
}