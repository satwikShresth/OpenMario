import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

export default [
   {
      title: 'Authentication',
      description: 'Log into drexelone',
      Content: StepOne,
   },
   {
      title: 'Screenshot',
      description: 'Screenshoting rankings',
      Content: StepTwo,
   },
   {
      title: 'Processing',
      description: 'Data extraction',
      Content: StepThree,
   },
];
