import HomeOne from "./HomeOne";
import Create from "./Create";
import TokenDetails from "./TokenDetails";
import UserProfile from "./UserProfile";


const routes = [
  { path: '/', component: <HomeOne />},
  { path: '/create', component: <Create />},
  { path: '/token', component: <TokenDetails />},
  { path: '/profile/:id', component: <UserProfile />},
]

export default routes;