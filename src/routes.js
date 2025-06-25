//Importo somente a funcão router
import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import DashboardsController from './app/controllers/DashboardsController';
import SessionsController from './app/controllers/SessionsController';

const routes = new Router();

//################## PROOF #####################
//Session
routes.post('/proof/session', SessionsController.store);
//################## PROOF #####################

//################## MIDDLEWARE AUTH #####################
routes.use(authMiddleware);
//################## MIDDLEWARE AUTH #####################

//################## AUTH PROOF #####################
//Dashboard
routes.get('/proof/dashboard', DashboardsController.index);

//################## AUTH PROOF #####################

export default routes;
