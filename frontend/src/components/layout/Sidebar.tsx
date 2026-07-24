import { NavLink } from 'react-router-dom';

import styles from './layout.module.css';



export function Sidebar() {


  return (


    <aside className={styles.sidebar}>


      <div>

        <strong>
          SYNARA
        </strong>

      </div>





      <nav>


        <ul>



          <li>

            <NavLink to="/">

              Inicio

            </NavLink>

          </li>





          <li>

            <NavLink to="/profile">

              Perfil

            </NavLink>

          </li>





          <li>

            <NavLink to="/migraine">

              Migrañas

            </NavLink>

          </li>





          <li>

            <NavLink to="/anxiety">

              Ansiedad

            </NavLink>

          </li>





          <li>

            <NavLink to="/panic">

              Ataques de pánico

            </NavLink>

          </li>





          <li>

            <NavLink to="/journal">

              Journal

            </NavLink>

          </li>





          <li>

            <NavLink to="/reports">

              Reportes

            </NavLink>

          </li>



        </ul>


      </nav>


    </aside>


  );

}