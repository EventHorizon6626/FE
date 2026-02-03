// src/routes.js
import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdHome,
  MdLock,
} from 'react-icons/md';

// Admin Imports
import LandingPage from 'views/admin/landing';
// import PortfolioAnalyzer from 'views/admin/portfolio/PortfolioAnalyzer'; // Removed - now in Horizon page
import PipelineBuilder from 'views/admin/pipeline';
import Profile from 'views/admin/profile';
// import RTL from 'views/admin/rtl';

// Auth Imports
import SignInCentered from 'views/auth/signIn';

const routes = [
  // ----- PUBLIC HOME PAGE -----
  {
    name: 'Home',
    layout: '/',
    path: '/',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <LandingPage />,
    requiresAuth: false,
    hideInSidebar: true, // Don't show in sidebar navigation
  },
  // ----- PROTECTED (requiresAuth: true) -----
  // Portfolio removed - now integrated in Horizon page
  {
    name: 'Horizon',
    layout: '/',
    path: '/pipeline',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <PipelineBuilder />,
    requiresAuth: false,
  },
  {
    name: 'Profile',
    layout: '/',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
    requiresAuth: true,
  },

  // ----- GUEST ONLY -----
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
    guestOnly: true,
  },

  // ----- PUBLIC (example) -----
  // {
  //   name: 'RTL Admin',
  //   layout: '/rtl',
  //   path: '/rtl-default',
  //   icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  //   component: <RTL />,
  //   // public: true
  // },
];

export default routes;
