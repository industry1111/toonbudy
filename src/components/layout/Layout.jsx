import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEditorPage = location.pathname.startsWith('/editor');

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={styles.container}>
      <div style={styles.bgPattern} />
      <div style={styles.wrapper}>
        <Header onToggleSidebar={toggleSidebar} />
        <div style={styles.contentWrapper}>
          {!isEditorPage && (
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          )}
          <main
            className={isEditorPage ? '' : 'layout-main'}
            style={isEditorPage ? styles.mainEditor : styles.main}
          >
            <Outlet />
          </main>
        </div>
        {!isEditorPage && <Footer />}
      </div>

      <style>{`
        .layout-main {
          margin-left: 240px;
        }
        @media (max-width: 1024px) {
          .layout-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FDF8F3 0%, #F5EDE4 50%, #E8F0ED 100%)',
    position: 'relative',
  },
  bgPattern: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 20px 20px, rgba(180, 160, 140, 0.06) 2px, transparent 2px)`,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  contentWrapper: {
    display: 'flex',
    flex: 1,
  },
  main: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    minHeight: 'calc(100vh - 70px)',
  },
  mainEditor: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
};
