import LoginScreen from '../components/LogInScreen/LogInScreen';
import UserScreen from '../components/UserScreen/UserScreen';
import SignupPage from '../components/SignupPage/SignupPage';
import Whales from '../components/Whales/Whales';
import NotFound from '../components/404/404';

export default [
    {
        path: '/',
        exact: true,
        component: LoginScreen
    },
    {
        path: '/user/sign-up',
        component: SignupPage
    },
    {
        path: '/user/:username/whales-orders',
        component: Whales
    },
    {
        path: '/user/:id',
        component: UserScreen
    },
    {
        path: '/*',
        component: NotFound
    }
]