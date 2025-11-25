export const css = {
   // Remove ugly borders on scrollgrid table
   '& .fc-scrollgrid': {
      border: 'none !important',
      borderWidth: '0 !important'
   },
   '& .fc-scrollgrid-liquid': {
      border: 'none !important'
   },
   // Remove today's highlight
   '& .fc-day-today': {
      backgroundColor: 'transparent !important'
   },
   '& .fc-timegrid-col.fc-day-today': {
      backgroundColor: 'transparent !important'
   },
   '& .fc-col-header-cell.fc-day-today': {
      backgroundColor: 'var(--chakra-colors-bg-subtle) !important'
   },
   // Reduce slot height for more compact view
   '& .fc-timegrid-slot': {
      height: '30px !important',
      minHeight: '30px !important'
   },
   // Add padding to the calendar body
   '& .fc-timegrid-body': {
      minHeight: '400px'
   },
   // Header toolbar spacing
   '& .fc-header-toolbar': {
      marginBottom: '10px !important',
      padding: '5px 0',
      display: 'none !important' // Hide default toolbar
   },
   // Make scrollable area more spacious
   '& .fc-scroller': {
      overflowY: 'auto !important'
   },
   // Ensure proper table layout
   '& .fc-timegrid-axis-frame': {
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex'
   },
   // Use Chakra color mode compatible colors
   '& .fc-theme-standard td': {
      borderColor: 'var(--chakra-colors-border)'
   },
   '& .fc-theme-standard th': {
      borderColor: 'var(--chakra-colors-border)'
   },
   '& .fc-col-header-cell': {
      backgroundColor: 'var(--chakra-colors-bg-subtle)',
      color: 'var(--chakra-colors-fg)',
      padding: '8px 4px !important',
      fontSize: '13px',
      fontWeight: '600'
   },
   '& .fc-timegrid-slot-label': {
      color: 'var(--chakra-colors-fg)',
      padding: '4px 8px !important',
      fontSize: '12px',
      fontWeight: '500',
      verticalAlign: 'middle'
   },
   '& .fc-toolbar-title': {
      color: 'var(--chakra-colors-fg-emphasized)',
      display: 'none'
   },
   '& .fc-timegrid-axis': {
      width: '60px !important',
      minWidth: '60px !important',
      visibility: 'visible !important',
      opacity: '1 !important',
      backgroundColor: 'var(--chakra-colors-bg-subtle)'
   },
   // Style events
   '& .fc-event': {
      cursor: 'pointer',
      fontSize: '12px',
      padding: '2px 4px',
      borderRadius: '4px'
   },
   '& .fc-event:hover': {
      opacity: '0.9'
   },
   // Style selection area
   '& .fc-highlight': {
      backgroundColor: 'var(--chakra-colors-blue-100)',
      opacity: '0.3'
   }
};
