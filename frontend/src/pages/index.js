import HomeOne from "./HomeOne";
import Create from "./Create";
import TokenDetails from "./TokenDetails";


const routes = [
  { path: '/', component: <HomeOne />},
  { path: '/create', component: <Create />},
  { path: '/token', component: <TokenDetails />},
]

export default routes;