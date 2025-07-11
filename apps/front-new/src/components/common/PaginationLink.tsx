import { IconButton, type IconButtonProps, usePaginationContext } from '@chakra-ui/react';
import { Link, type LinkOptions } from '@tanstack/react-router';

export const PaginationLink = (
   props: IconButtonProps & { to: LinkOptions['to'] } & { page?: 'prev' | 'next' | number },
) => {
   const { page, to, ...rest } = props;
   const pagination = usePaginationContext();
   const pageValue = () => {
      if (page === 'prev') return pagination.previousPage;
      if (page === 'next') return pagination.nextPage;
      return page;
   };
   return (
      <IconButton asChild {...rest}>
         <Link to={to} search={{ pageIndex: pageValue() }}>
            {props.children}
         </Link>
      </IconButton>
   );
};
