import Menu from '../../components/Menu';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

import '../../styles/MyHeart.css';

const myHeart = () => {

  return (
    <>
      <div className="myheart-wrapper">
        <div className="myheart-container">
          <h1 className="myheart-title">My Heart</h1>
        </div>
      </div>
      <Menu />
      <Sidebar />  
      <div className="myheart-footer">
        <Footer />
      </div>
    </>
  );
};

export default myHeart;