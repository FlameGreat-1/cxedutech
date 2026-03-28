import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import UserAccount from './pages/UserAccount';
import AdminPanel from './pages/AdminPanel';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Switch>
          <Route path="/" exact component={Landing} />
          <Route path="/store" component={Store} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-confirmation" component={OrderConfirmation} />
          <Route path="/user-account" component={UserAccount} />
          <Route path="/admin" component={AdminPanel} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
};

export default App;