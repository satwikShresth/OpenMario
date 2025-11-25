// import { env } from '@env';
// import LogRocket from 'logrocket';
// import setupLogRocketReact from 'logrocket-react';

const reportWebVitals = (onPerfEntry?: () => void) => {
   // LogRocket.init(env.VITE_LR_APP_ID);
   // setupLogRocketReact(LogRocket);
   if (onPerfEntry && onPerfEntry instanceof Function) {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
         onCLS(onPerfEntry);
         onINP(onPerfEntry);
         onFCP(onPerfEntry);
         onLCP(onPerfEntry);
         onTTFB(onPerfEntry);
      });
   }
};

export default reportWebVitals;
