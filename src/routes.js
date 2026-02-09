import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdHome,
  MdLock,
  MdShowChart,
  MdLibraryBooks,
} from 'react-icons/md';

import LandingPage from 'views/admin/landing';
import Dashboard from 'views/admin/dashboard';
import PipelineList from 'views/admin/pipeline';
import PipelineDetail from 'views/admin/pipeline/detail';
import Library from 'views/admin/library';
import Profile from 'views/admin/profile';
import SignInCentered from 'views/auth/signIn';

const routes = [
  {
    name: 'Home',
    layout: '/',
    path: '/',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <LandingPage />,
    requiresAuth: true,
    hideInSidebar: true,
  },
  {
    name: 'Horizon',
    layout: '/',
    path: '/pipeline',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <PipelineList />,
    requiresAuth: false, // Temporarily disabled for testing
  },
  {
    name: 'Library',
    layout: '/',
    path: '/library',
    icon: <Icon as={MdLibraryBooks} width="20px" height="20px" color="inherit" />,
    component: <Library />,
    requiresAuth: false,
  },
  {
    name: 'Dashboard',
    layout: '/',
    path: '/dashboard',
    icon: <Icon as={MdShowChart} width="20px" height="20px" color="inherit" />,
    component: <Dashboard />,
    requiresAuth: false, // Temporarily disabled for testing
  },
  {
    name: 'Horizon Detail',
    layout: '/',
    path: '/pipeline/:id',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <PipelineDetail />,
    requiresAuth: false, // Temporarily disabled for testing
    hideInSidebar: true,
  },
  {
    name: 'Profile',
    layout: '/',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
    requiresAuth: true,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
    guestOnly: true,
  },
];

export default routes;
