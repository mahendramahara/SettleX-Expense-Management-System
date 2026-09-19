import userDemoData from './user-demo.json';
import adminDemoData from './admin-demo.json';

export const USER_DEMO = userDemoData;
export const ADMIN_DEMO = adminDemoData.admin || adminDemoData;

export const DEMO = {
  ...userDemoData,
  admin: ADMIN_DEMO,
};

export default DEMO;
