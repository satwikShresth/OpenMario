import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '#/stores/useFavoriteStore';
import { Configure, useInstantSearch } from 'react-instantsearch';

interface FavoritesToggleProps {
   idField?: string;
}

export function FavoritesToggle({ idField = 'id' }: FavoritesToggleProps) {
   const { getAllFavorites } = useFavoritesStore();
   const { results } = useInstantSearch();
   const [showFavorites, setShowFavorites] = React.useState(false);
   const favorites = getAllFavorites();
   const hasFavorites = favorites.length > 0;

   const hasResults = results?.nbHits > 0;

   const handleToggleFavorites = () => {
      setShowFavorites(!showFavorites);
   };

   // Build the filter string for favorites for Meilisearch
   const favoritesFilter = React.useMemo(() => {
      if (!showFavorites || !hasFavorites) return undefined;

      // Create filter expression with the specified ID field
      return favorites.map((fav) => `${idField} = "${fav}"`).join(' OR ');
   }, [showFavorites, favorites, hasFavorites, idField]);

   const tooltipTitle = !hasFavorites
      ? "You haven't favorited any items yet"
      : showFavorites && !hasResults
      ? 'No favorited items match your current search and filters'
      : showFavorites
      ? 'Show all items'
      : `Show only your ${favorites.length} favorited item${favorites.length !== 1 ? 's' : ''}`;

   return (
      <>
         {/* This Configure widget makes the filters work */}
         {showFavorites && hasFavorites && <Configure filters={favoritesFilter} />}

         <Tooltip title={tooltipTitle} arrow placement='top'>
            <span>
               <Button
                  variant={showFavorites ? 'contained' : 'outlined'}
                  color={showFavorites && !hasResults ? 'error' : 'primary'}
                  onClick={handleToggleFavorites}
                  disabled={!hasFavorites && !showFavorites}
                  startIcon={<Heart size={18} fill={showFavorites ? 'currentColor' : 'none'} />}
                  sx={{
                     borderRadius: '20px',
                     border: '2px solid black',
                     boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                     transition: 'all 0.1s ease-in-out',
                     textTransform: 'none',
                     fontWeight: 600,
                     '&:hover': {
                        transform: !hasFavorites ? 'none' : 'translateY(2px)',
                        boxShadow: !hasFavorites
                           ? '0 4px 0 rgba(0,0,0,0.2)'
                           : '0 2px 0 rgba(0,0,0,0.2)',
                     },
                     '&:active': {
                        transform: !hasFavorites ? 'none' : 'translateY(4px)',
                        boxShadow: !hasFavorites ? '0 4px 0 rgba(0,0,0,0.2)' : 'none',
                     },
                  }}
               >
                  {showFavorites
                     ? 'Show All'
                     : `Favorites Only ${hasFavorites ? `(${favorites.length})` : ''}`}
               </Button>
            </span>
         </Tooltip>
      </>
   );
}

export default FavoritesToggle;
