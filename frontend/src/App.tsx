import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';


import { AppLayout } from './components/layout/AppLayout';


import { DashboardPage } from './features/dashboard/DashboardPage';

import { MigrainePage } from './features/migraine/pages/MigrainePage';



function App() {

  return (

    <BrowserRouter>

      <Routes>


        <Route
          element={<AppLayout />}
        >


          <Route
            path="/"
            element={<DashboardPage />}
          />


          <Route
            path="/migraine"
            element={<MigrainePage />}
          />


        </Route>


      </Routes>


    </BrowserRouter>

  );

}


export default App;