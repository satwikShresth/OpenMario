import { chakraComponents } from 'chakra-react-select';

export const asyncComponents = {
   LoadingIndicator: (props: any) => (
      <chakraComponents.LoadingIndicator
         // The color palette of the filled in area of the spinner (there is no default)
         colorPalette='gray'
         // The color of the main line which makes up the spinner
         // This could be accomplished using `chakraStyles` but it is also available as a custom prop
         color='currentColor' // <-- This default's to your theme's text color (Light mode: gray.700 | Dark mode: whiteAlpha.900)
         // The color of the remaining space that makes up the spinner
         trackColor='transparent'
         // The `size` prop on the Chakra spinner
         // Defaults to one size smaller than the Select's size
         spinnerSize='md'
         // A CSS <time> variable (s or ms) which determines the time it takes for the spinner to make one full rotation
         animationDuration='500ms'
         // A CSS size string representing the thickness of the spinner's line
         borderWidth='2px'
         {
            // Don't forget to forward the props!
            ...props
         }
      />
   ),
};
