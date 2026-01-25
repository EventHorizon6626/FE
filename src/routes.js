// src/routes.js
import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
} from 'react-icons/md';

// Admin Imports
import PortfolioCreator from 'views/admin/portfolio';
import MainDashboard from 'views/admin/default';
import Profile from 'views/admin/profile';
// import RTL from 'views/admin/rtl';

// Auth Imports
import SignInCentered from 'views/auth/signIn';

const routes = [
  // ----- PROTECTED (requiresAuth: true) -----
  {
    name: 'Portfolio',
    layout: '/',
    path: '/',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <PortfolioCreator />,
    requiresAuth: false,
  },
  {
    name: 'Dashboard',
    layout: '/',
    path: '/dashboard',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
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

  // ----- PUBLIC (ví dụ) -----
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
