import logo from './logo.svg';
//import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SubmitLoanApplication from './components/SubmitLoanApplication';
import LoanOfficerDashboard from './components/LoanOfficerDashboard';
import ProtectedRoute from './components/ProtectedRoute'
import LoanDetails from './components/LoanDetails';
import { Link } from 'react-router-dom'; // Import for routing
import Home from './components/Home';
import WrappedMakePayment from './components/MakePayment';

const App = () => {
  return (
      <Router>
          <div>
              <Routes>
                  <Route path="/register" element={<Registration />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/submit-loan-application" element={<SubmitLoanApplication/>} />
                  <Route path="/" element={<Home />} />
                  <Route path="/loan/:username" element={<LoanDetails />} />
                  <Route path="/make-payment/:loanID" element={<WrappedMakePayment />} /> {/* Add this line */}
                  <Route 
                    path="/loan-officer-dashboard" 
                    element={
                      <ProtectedRoute>
                        <LoanOfficerDashboard />
                      </ProtectedRoute>
                   } 
                  />
              </Routes>
          </div>
          
      </Router>
  );
      

};

export default App;
//function App() {
  //return (
    //<div className="App">
     // <header className="App-header">
       // <img src={logo} className="App-logo" alt="logo" />
      //  <p>
      //    Edit <code>src/App.js</code> and save to reload.
      //  </p>
      //  <a
       //   className="App-link"
       //   href="https://reactjs.org"
       //   target="_blank"
        //  rel="noopener noreferrer"
       // >
       //   Learn React
      //  </a>
   //  </header>
  //  </div>
 // );
//}

//export default App;
