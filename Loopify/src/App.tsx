import { useState } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './page/Login';
import RegistPage from './page/Regist';
import Sidebar from './components/SideBar';
import MainContent from './components/content';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // ✅ เรียกตอนล็อกอินสำเร็จ เพื่อกลับหน้า Home
  const handleLoginSuccess = (account: string) => {
    alert(`Welcome to Loopify: ${account}`);   // ✅ ใช้ตัวแปร account ได้แล้ว
    setCurrentPage('home');
  };

  const mainAppLayout = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000' }}>
      <Navbar 
        onLoginClick={() => setCurrentPage('login')} 
        onRegisterClick={() => setCurrentPage('register')} 
      />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar /> 
        <MainContent />
      </div>
    </div>
  );

  switch (currentPage) {
    case 'login':
      return (
        <LoginPage
          onBackClick={() => setCurrentPage('home')}
          onLoginSuccess={handleLoginSuccess}  // ⬅️ ใช้ฟังก์ชันจริง ไม่ใช่ throw
        />
      );
    case 'register':
      return <RegistPage onBackClick={() => setCurrentPage('home')} />;
    default:
      return mainAppLayout;
  }
}

export default App;
