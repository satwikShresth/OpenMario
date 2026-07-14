export const css = {
   '& .fc': {
      height: '100%',
      '--fc-border-color': 'var(--chakra-colors-border)',
      '--fc-page-bg-color': 'var(--chakra-colors-bg)',
      '--fc-neutral-bg-color': 'var(--chakra-colors-bg-subtle)',
      '--fc-today-bg-color': 'transparent',
      '--fc-now-indicator-color': 'var(--chakra-colors-blue-solid)',
      '--fc-highlight-color': 'color-mix(in srgb, var(--chakra-colors-blue-solid) 12%, transparent)',
      fontSize: '13px',
   },
   '& .fc-view-harness': {
      height: '100%',
   },
   '& .fc-scrollgrid, & .fc-scrollgrid-liquid': {
      border: 'none !important',
      height: '100%',
   },
   '& .fc-theme-standard td, & .fc-theme-standard th': {
      borderColor: 'var(--chakra-colors-border)',
   },
   '& .fc-day-today, & .fc-timegrid-col.fc-day-today': {
      backgroundColor: 'transparent !important',
   },
   '& .fc-col-header-cell.fc-day-today': {
      backgroundColor: 'var(--chakra-colors-bg-muted) !important',
   },
   '& .fc-col-header-cell': {
      backgroundColor: 'var(--chakra-colors-bg-subtle)',
      color: 'var(--chakra-colors-fg)',
      padding: '10px 4px !important',
      fontSize: '13px',
      fontWeight: '600',
   },
   '& .fc-col-header-cell-cushion': {
      color: 'inherit',
      textDecoration: 'none',
   },
   '& .fc-timegrid-slot': {
      height: '2.35em',
      borderColor: 'var(--chakra-colors-border) !important',
   },
   '& .fc-timegrid-slot-minor': {
      borderColor: 'color-mix(in srgb, var(--chakra-colors-border) 50%, transparent) !important',
   },
   '& .fc-timegrid-slot-label': {
      color: 'var(--chakra-colors-fg-muted)',
      padding: '0 8px !important',
      fontSize: '12px',
      fontWeight: '500',
      verticalAlign: 'middle',
   },
   '& .fc-timegrid-axis': {
      width: '56px !important',
      minWidth: '56px !important',
      backgroundColor: 'var(--chakra-colors-bg-subtle)',
   },
   '& .fc-timegrid-axis-frame': {
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
   },
   '& .fc-timegrid-body': {
      width: '100% !important',
   },
   '& .fc-event': {
      cursor: 'pointer',
      fontSize: '12px',
      padding: '2px 4px',
      borderRadius: '6px',
      borderWidth: '1px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
   },
   '& .fc-event:hover': {
      opacity: '0.92',
   },
   '& .fc-timegrid-now-indicator-line': {
      borderWidth: '2px',
   },
}
